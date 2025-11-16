from rest_framework import serializers
from .models import Receipt
from apps.joborder.models import JobOrder


class ReceiptSerializer(serializers.ModelSerializer):
    job_order_number = serializers.CharField(source='job_order.job_order_number', read_only=True)
    customer_name = serializers.CharField(source='job_order.customer.name', read_only=True)
    
    class Meta:
        model = Receipt
        fields = [
            'id',
            'receipt_id',
            'receipt_date',
            'receipt_amount',
            'receipt_remarks',
            'job_order',
            'job_order_number',
            'customer_name',
            'created_at',
            'updated_at',
            'is_active'
        ]
        read_only_fields = ['id', 'receipt_id', 'created_at', 'updated_at']
        extra_kwargs = {
            'receipt_remarks': {'required': False, 'allow_blank': True},
        }

    def create(self, validated_data):
        """Override create to auto-generate receipt_id"""
        # Auto-generate receipt_id if not provided
        if 'receipt_id' not in validated_data or not validated_data['receipt_id']:
            validated_data['receipt_id'] = self.generate_receipt_id()
        
        return super().create(validated_data)

    def generate_receipt_id(self):
        """Generate a unique receipt ID starting from 1"""
        # Get the last receipt to generate next sequence number
        last_receipt = Receipt.objects.order_by('-id').first()
        
        if last_receipt:
            # Extract sequence number from last receipt ID and increment
            try:
                # Handle both old format (RCP20240115001) and new format (RCP001)
                if last_receipt.receipt_id.startswith('RCP') and len(last_receipt.receipt_id) > 3:
                    # Extract the numeric part
                    numeric_part = last_receipt.receipt_id[3:]
                    # If it's the old format, get the last 3 digits
                    if len(numeric_part) > 3:
                        sequence = int(numeric_part[-3:]) + 1
                    else:
                        sequence = int(numeric_part) + 1
                else:
                    sequence = 1
            except (ValueError, IndexError):
                sequence = 1
        else:
            sequence = 1
        
        # Format: RCP + 3-digit sequence (e.g., RCP001, RCP002, etc.)
        receipt_id = f'RCP{sequence:03d}'
        return receipt_id

    def validate_receipt_amount(self, value):
        """Validate receipt amount is positive"""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Receipt amount must be greater than 0")
        return value

    def validate_job_order(self, value):
        """Validate job order exists and is active"""
        if not value.is_active:
            raise serializers.ValidationError("Cannot create receipt for inactive job order")
        return value

    def validate(self, data):
        """Cross-field validation"""
        job_order = data.get('job_order')
        receipt_amount = data.get('receipt_amount')
        
        if job_order and receipt_amount:
            # Check if receipt amount doesn't exceed job order balance
            if receipt_amount > job_order.balance_amount:
                raise serializers.ValidationError(
                    f"Receipt amount ({receipt_amount}) cannot exceed job order balance ({job_order.balance_amount})"
                )
        
        return data


class ReceiptCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating receipts"""
    
    class Meta:
        model = Receipt
        fields = [
            'receipt_date',
            'receipt_amount',
            'receipt_remarks',
            'job_order'
        ]
        extra_kwargs = {
            'receipt_remarks': {'required': False, 'allow_blank': True},
        }

    def create(self, validated_data):
        """Override create to auto-generate receipt_id"""
        # Auto-generate receipt_id
        validated_data['receipt_id'] = self.generate_receipt_id()
        
        return super().create(validated_data)

    def generate_receipt_id(self):
        """Generate a unique receipt ID starting from 1"""
        # Get the last receipt to generate next sequence number
        last_receipt = Receipt.objects.order_by('-id').first()
        
        if last_receipt:
            # Extract sequence number from last receipt ID and increment
            try:
                # Handle both old format (RCP20240115001) and new format (RCP001)
                if last_receipt.receipt_id.startswith('RCP') and len(last_receipt.receipt_id) > 3:
                    # Extract the numeric part
                    numeric_part = last_receipt.receipt_id[3:]
                    # If it's the old format, get the last 3 digits
                    if len(numeric_part) > 3:
                        sequence = int(numeric_part[-3:]) + 1
                    else:
                        sequence = int(numeric_part) + 1
                else:
                    sequence = 1
            except (ValueError, IndexError):
                sequence = 1
        else:
            sequence = 1
        
        # Format: RCP + 3-digit sequence (e.g., RCP001, RCP002, etc.)
        receipt_id = f'RCP{sequence:03d}'
        return receipt_id

    def validate_receipt_amount(self, value):
        """Validate receipt amount is positive"""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Receipt amount must be greater than 0")
        return value

    def validate_job_order(self, value):
        """Validate job order exists and is active"""
        if not value.is_active:
            raise serializers.ValidationError("Cannot create receipt for inactive job order")
        return value

    def validate(self, data):
        """Cross-field validation"""
        job_order = data.get('job_order')
        receipt_amount = data.get('receipt_amount')
        
        if job_order and receipt_amount:
            # Check if receipt amount doesn't exceed job order balance
            if receipt_amount > job_order.balance_amount:
                raise serializers.ValidationError(
                    f"Receipt amount ({receipt_amount}) cannot exceed job order balance ({job_order.balance_amount})"
                )
        
        return data
