from rest_framework import serializers
from .models import JobOrder, jobOrderItem, jobOrderMeasurement
from apps.crm.models import Customer
from apps.materials.models import Material


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'customer_id', 'name', 'phone', 'balance', 'points', 'is_active']


class JobOrderItemSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)
    material_price = serializers.DecimalField(source='material.price', max_digits=10, decimal_places=2, read_only=True)
    material = serializers.PrimaryKeyRelatedField(queryset=Material.objects.all())
    
    class Meta:
        model = jobOrderItem
        fields = ['id', 'material', 'material_name', 'material_price', 'quantity', 'fees', 'total_amount', 'is_active']
        read_only_fields = ['id', 'total_amount']


class JobOrderMeasurementSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)
    material = serializers.PrimaryKeyRelatedField(queryset=Material.objects.all())
    
    class Meta:
        model = jobOrderMeasurement
        fields = ['id', 'material', 'material_name', 'thool', 'kethet', 'thool_kum', 'ardh_f_kum', 'jamba', 'ragab', 'note1', 'note2', 'note3', 'note4', 'is_active']
        read_only_fields = ['id']


class JobOrderMeasurementReadSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)
    
    class Meta:
        model = jobOrderMeasurement
        fields = ['id', 'material_name', 'thool', 'kethet', 'thool_kum', 'ardh_f_kum', 'jamba', 'ragab', 'note1', 'note2', 'note3', 'note4', 'is_active']
        read_only_fields = ['id']


class JobOrderCreateSerializer(serializers.ModelSerializer):
    customer_data = CustomerSerializer(required=False)
    customer_id = serializers.IntegerField(required=False, allow_null=True)
    job_order_items = JobOrderItemSerializer(many=True, required=False)
    job_order_measurements = JobOrderMeasurementSerializer(many=True, required=False)
    
    class Meta:
        model = JobOrder
        fields = [
            'id', 'job_order_number', 'customer', 'customer_id', 'customer_data',
            'status', 'delivery_date', 'total_amount', 'advance_amount', 'balance_amount', 'recived_on_delivery_amount',
            'payment_method', 'cash_amount', 'card_amount', 'remarks', 'is_active', 'is_blocked', 'job_order_items', 'job_order_measurements'
        ]
        read_only_fields = ['id', 'job_order_number', 'balance_amount']
        extra_kwargs = {
            'customer': {'required': False},
            'delivery_date': {'required': False, 'allow_null': True}
        }

    def create(self, validated_data):
        # Extract nested data
        customer_data = validated_data.pop('customer_data', None)
        customer_id = validated_data.pop('customer_id', None)
        job_order_items_data = validated_data.pop('job_order_items', [])
        job_order_measurements_data = validated_data.pop('job_order_measurements', [])
        
        # Handle customer creation/selection
        customer = None
        if customer_id:
            try:
                customer = Customer.objects.get(id=customer_id)
            except Customer.DoesNotExist:
                raise serializers.ValidationError("Customer with provided ID does not exist")
        elif customer_data:
            # Create new customer
            customer = Customer.objects.create(**customer_data)
        else:
            raise serializers.ValidationError("Either customer_id or customer_data must be provided")
        
        # Set customer and generate job order number
        validated_data['customer'] = customer
        if not validated_data.get('job_order_number'):
            validated_data['job_order_number'] = f"JO-{JobOrder.objects.count() + 1:04d}"
        
        # Set default delivery date if not provided
        if not validated_data.get('delivery_date'):
            from django.utils import timezone
            validated_data['delivery_date'] = timezone.now() + timezone.timedelta(days=7)  # Default to 7 days from now
        
        # Calculate balance amount
        total_amount = validated_data.get('total_amount', 0)
        advance_amount = validated_data.get('advance_amount', 0)
        validated_data['balance_amount'] = total_amount - advance_amount
        
        # Handle cash and card amounts based on payment method
        payment_method = validated_data.get('payment_method', 'cash')
        cash_amount = validated_data.get('cash_amount', 0)
        card_amount = validated_data.get('card_amount', 0)
        
        if payment_method == 'cash':
            validated_data['cash_amount'] = total_amount
            validated_data['card_amount'] = 0
        elif payment_method == 'card':
            validated_data['cash_amount'] = 0
            validated_data['card_amount'] = total_amount
        elif payment_method == 'cash_card':
            # For cash_card, use the provided amounts or default to total_amount split
            if cash_amount == 0 and card_amount == 0:
                validated_data['cash_amount'] = total_amount / 2
                validated_data['card_amount'] = total_amount / 2
            else:
                validated_data['cash_amount'] = cash_amount
                validated_data['card_amount'] = card_amount
        
        # Create job order
        job_order = JobOrder.objects.create(**validated_data)
        
        # Create job order items
        for item_data in job_order_items_data:
            # Handle material field - it could be an ID or a Material object
            material_field = item_data.get('material')
            if material_field is None:
                raise serializers.ValidationError("Material field is required for job order items")
            
            if isinstance(material_field, Material):
                material_id = material_field.id
            else:
                material_id = material_field
            
            # Ensure material_id is a valid integer
            try:
                material_id = int(material_id)
            except (ValueError, TypeError):
                raise serializers.ValidationError(f"Invalid material ID: {material_id}. Expected an integer, got {type(material_id).__name__}")
            
            quantity = item_data['quantity']
            fees = item_data['fees']
            total_amount = quantity * fees
            
            # Get the Material object
            try:
                material = Material.objects.get(id=material_id)
            except Material.DoesNotExist:
                raise serializers.ValidationError(f"Material with ID {material_id} does not exist")
            
            jobOrderItem.objects.create(
                job_order=job_order,
                material=material,
                quantity=quantity,
                fees=fees,
                total_amount=total_amount
            )
        
        # Create job order measurements
        for measurement_data in job_order_measurements_data:
            # Handle material field - it could be an ID or a Material object
            material_field = measurement_data.get('material')
            if material_field is None:
                raise serializers.ValidationError("Material field is required for measurements")
            
            if isinstance(material_field, Material):
                material_id = material_field.id
            else:
                material_id = material_field
            
            # Ensure material_id is a valid integer
            try:
                material_id = int(material_id)
            except (ValueError, TypeError):
                raise serializers.ValidationError(f"Invalid material ID: {material_id}. Expected an integer, got {type(material_id).__name__}")
            
            # Get the Material object
            try:
                material = Material.objects.get(id=material_id)
            except Material.DoesNotExist:
                raise serializers.ValidationError(f"Material with ID {material_id} does not exist")
            
            # Remove material from measurement_data and add the Material object
            measurement_data_copy = measurement_data.copy()
            measurement_data_copy.pop('material', None)
            
            jobOrderMeasurement.objects.create(
                job_order=job_order,
                material=material,
                **measurement_data_copy
            )
        
        return job_order


class JobOrderUpdateSerializer(serializers.ModelSerializer):
    job_order_items = JobOrderItemSerializer(many=True, required=False)
    job_order_measurements = JobOrderMeasurementSerializer(many=True, required=False)
    
    class Meta:
        model = JobOrder
        fields = [
            'id', 'job_order_number', 'customer', 'status', 'delivery_date',
            'total_amount', 'advance_amount', 'balance_amount', 'recived_on_delivery_amount', 'payment_method', 'cash_amount', 'card_amount', 'remarks',
            'is_active', 'is_blocked', 'job_order_items', 'job_order_measurements'
        ]
        read_only_fields = ['id', 'job_order_number', 'customer']

    def update(self, instance, validated_data):
        # Extract nested data
        job_order_items_data = validated_data.pop('job_order_items', None)
        job_order_measurements_data = validated_data.pop('job_order_measurements', None)
        
        # Calculate balance amount if total or advance changed
        if 'total_amount' in validated_data or 'advance_amount' in validated_data:
            total_amount = validated_data.get('total_amount', instance.total_amount)
            advance_amount = validated_data.get('advance_amount', instance.advance_amount)
            validated_data['balance_amount'] = total_amount - advance_amount
        
        # Handle cash and card amounts based on payment method
        payment_method = validated_data.get('payment_method', instance.payment_method)
        total_amount = validated_data.get('total_amount', instance.total_amount)
        cash_amount = validated_data.get('cash_amount', instance.cash_amount)
        card_amount = validated_data.get('card_amount', instance.card_amount)
        
        if payment_method == 'cash':
            validated_data['cash_amount'] = total_amount
            validated_data['card_amount'] = 0
        elif payment_method == 'card':
            validated_data['cash_amount'] = 0
            validated_data['card_amount'] = total_amount
        elif payment_method == 'cash_card':
            # For cash_card, use the provided amounts or keep existing if not provided
            if 'cash_amount' not in validated_data and 'card_amount' not in validated_data:
                # If neither is provided, split the total amount
                validated_data['cash_amount'] = total_amount / 2
                validated_data['card_amount'] = total_amount / 2
            # If only one is provided, calculate the other
            elif 'cash_amount' in validated_data and 'card_amount' not in validated_data:
                validated_data['card_amount'] = total_amount - cash_amount
            elif 'card_amount' in validated_data and 'cash_amount' not in validated_data:
                validated_data['cash_amount'] = total_amount - card_amount
        
        # Update job order
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update job order items if provided
        if job_order_items_data is not None:
            # Delete existing items
            instance.joborderitem_set.all().delete()
            
            # Create new items
            for item_data in job_order_items_data:
                # Handle material field - it could be an ID or a Material object
                material_field = item_data.get('material')
                if material_field is None:
                    raise serializers.ValidationError("Material field is required for job order items")
                
                if isinstance(material_field, Material):
                    material_id = material_field.id
                else:
                    material_id = material_field
                
                # Ensure material_id is a valid integer
                try:
                    material_id = int(material_id)
                except (ValueError, TypeError):
                    raise serializers.ValidationError(f"Invalid material ID: {material_id}. Expected an integer, got {type(material_id).__name__}")
                
                quantity = item_data['quantity']
                fees = item_data['fees']
                total_amount = quantity * fees
                
                # Get the Material object
                try:
                    material = Material.objects.get(id=material_id)
                except Material.DoesNotExist:
                    raise serializers.ValidationError(f"Material with ID {material_id} does not exist")
                
                jobOrderItem.objects.create(
                    job_order=instance,
                    material=material,
                    quantity=quantity,
                    fees=fees,
                    total_amount=total_amount
                )
        
        # Update job order measurements if provided
        if job_order_measurements_data is not None:
            # Delete existing measurements
            instance.jobordermeasurement_set.all().delete()
            
            # Create new measurements
            for measurement_data in job_order_measurements_data:
                print("=== MEASUREMENT DATA DEBUG ===")
                print("Measurement data:", measurement_data)
                print("Material field:", measurement_data.get('material'))
                print("Material type:", type(measurement_data.get('material')))
                
                # Handle material field - it could be an ID or a Material object
                material_field = measurement_data.get('material')
                if material_field is None:
                    raise serializers.ValidationError("Material field is required for measurements")
                
                if isinstance(material_field, Material):
                    material_id = material_field.id
                else:
                    material_id = material_field
                
                # Ensure material_id is a valid integer
                try:
                    material_id = int(material_id)
                except (ValueError, TypeError):
                    raise serializers.ValidationError(f"Invalid material ID: {material_id}. Expected an integer, got {type(material_id).__name__}")
                
                # Get the Material object
                try:
                    material = Material.objects.get(id=material_id)
                except Material.DoesNotExist:
                    raise serializers.ValidationError(f"Material with ID {material_id} does not exist")
                
                # Remove material from measurement_data and add the Material object
                measurement_data_copy = measurement_data.copy()
                measurement_data_copy.pop('material', None)
                
                jobOrderMeasurement.objects.create(
                    job_order=instance,
                    material=material,
                    **measurement_data_copy
                )
        
        return instance


class JobOrderListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    customer_id = serializers.CharField(source='customer.customer_id', read_only=True)
    job_order_items = serializers.SerializerMethodField()
    job_order_measurements = serializers.SerializerMethodField()
    
    def get_job_order_measurements(self, obj):
        measurements = obj.jobordermeasurement_set.filter(is_active=True)
        return JobOrderMeasurementReadSerializer(measurements, many=True).data
    
    def get_job_order_items(self, obj):
        items = obj.joborderitem_set.filter(is_active=True)
        return JobOrderItemSerializer(items, many=True).data
    
    class Meta:
        model = JobOrder
        fields = [
            'id', 'job_order_number', 'customer', 'customer_name', 'customer_phone', 'customer_id',
            'status', 'delivery_date', 'total_amount', 'advance_amount', 'balance_amount', 'recived_on_delivery_amount',
            'payment_method', 'cash_amount', 'card_amount', 'remarks', 'is_active', 'is_blocked', 'created_at', 'updated_at', 'job_order_items', 'job_order_measurements'
        ]
