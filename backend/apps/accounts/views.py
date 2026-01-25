from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction as db_transaction
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Transaction, TransactionLine
from apps.joborder.models import JobOrder
from apps.sale.models import Sale
from apps.receipt.models import Receipt
from apps.crm.models import Customer
import uuid


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing transactions.
    Provides methods to create/update transactions for Job Orders, Sales, and Receipts.
    """
    queryset = Transaction.objects.all()
    permission_classes = [IsAuthenticated]

    @staticmethod
    def generate_transaction_id():
        """Generate a unique transaction ID"""
        return f"TXN-{uuid.uuid4().hex[:8].upper()}"

    @staticmethod
    def transaction_create_or_update_job_order(job_order, is_update=False):
        """
        Create or update Transaction and TransactionLines for a Job Order.
        
        When a Job Order is created, a Transaction should be created.
        When advance_amount or delivery_amount changes, the corresponding TransactionLine should be created or updated.
        
        Args:
            job_order: JobOrder instance
            is_update: Boolean indicating if this is an update operation
        """
        try:
            with db_transaction.atomic():
                customer = job_order.customer
                
                # Get or create Transaction for this Job Order
                transaction_obj, created = Transaction.objects.get_or_create(
                    job_order=job_order,
                    defaults={
                        'customer': customer,
                        'transaction_id': TransactionViewSet.generate_transaction_id(),
                        'transaction_method': 'job_order',
                        'transaction_amount': job_order.total_amount,
                        'transaction_date': job_order.created_at if not is_update else timezone.now(),
                        'transaction_status': 'completed' if job_order.status == 'delivered' else 'pending',
                        'transaction_remarks': f'Transaction for Job Order {job_order.job_order_number}',
                        'is_active': True,
                    }
                )
                
                # If updating, update transaction details
                if not created and is_update:
                    transaction_obj.transaction_amount = job_order.total_amount
                    transaction_obj.transaction_status = 'completed' if job_order.status == 'delivered' else 'pending'
                    transaction_obj.transaction_remarks = f'Transaction for Job Order {job_order.job_order_number}'
                    transaction_obj.save()
                
                # Handle advance_amount TransactionLine
                if job_order.advance_amount and job_order.advance_amount > 0:
                    advance_line, advance_created = TransactionLine.objects.get_or_create(
                        transaction=transaction_obj,
                        transaction_line_method='job_order_advance',
                        defaults={
                            'transaction_line_type': 'credit',
                            'transaction_line_amount': job_order.advance_amount,
                            'transaction_line_description': f'Advance payment for Job Order {job_order.job_order_number}',
                            'is_active': True,
                        }
                    )
                    
                    # If updating and advance amount changed, update the line
                    if not advance_created and is_update:
                        advance_line.transaction_line_amount = job_order.advance_amount
                        advance_line.transaction_line_description = f'Advance payment for Job Order {job_order.job_order_number}'
                        advance_line.save()
                
                # Handle delivery_amount (recived_on_delivery_amount) TransactionLine
                if job_order.recived_on_delivery_amount and job_order.recived_on_delivery_amount > 0:
                    delivery_line, delivery_created = TransactionLine.objects.get_or_create(
                        transaction=transaction_obj,
                        transaction_line_method='job_order_delivery',
                        defaults={
                            'transaction_line_type': 'credit',
                            'transaction_line_amount': job_order.recived_on_delivery_amount,
                            'transaction_line_description': f'Delivery payment for Job Order {job_order.job_order_number}',
                            'is_active': True,
                        }
                    )
                    
                    # If updating and delivery amount changed, update the line
                    if not delivery_created and is_update:
                        delivery_line.transaction_line_amount = job_order.recived_on_delivery_amount
                        delivery_line.transaction_line_description = f'Delivery payment for Job Order {job_order.job_order_number}'
                        delivery_line.save()
                
                return transaction_obj
                
        except Exception as e:
            # Log the error but don't fail the main operation
            print(f"Error creating/updating transaction for job order {job_order.id}: {str(e)}")
            return None

    @staticmethod
    def transaction_create_or_update_sales(sale):
        """
        Create Transaction and TransactionLine for a Sale.
        
        When a Sales record is created, a Transaction should be created,
        and the corresponding amount should be reflected in a TransactionLine.
        
        Args:
            sale: Sale instance
        """
        try:
            with db_transaction.atomic():
                # For Sale, we need to find a Customer based on customer_name
                # Since Sale only has customer_name (string), we'll try to find existing customer
                # If not found, we'll create transaction without customer (customer can be null)
                customer = None
                try:
                    # Try to find customer by name
                    customer = Customer.objects.filter(name__iexact=sale.customer_name).first()
                except Exception:
                    pass
                
                # Create Transaction for this Sale (customer can be null)
                transaction_obj = Transaction.objects.create(
                    customer=customer,  # Can be None
                    sale=sale,
                    transaction_id=TransactionViewSet.generate_transaction_id(),
                    transaction_method='sale',
                    transaction_amount=sale.total_amount,
                    transaction_date=sale.date,
                    transaction_status='completed' if sale.status == 'completed' else 'pending',
                    transaction_remarks=f'Transaction for Sale {sale.sale_number}',
                    is_active=True,
                )
                
                # Create TransactionLine for the sale amount
                TransactionLine.objects.create(
                    transaction=transaction_obj,
                    transaction_line_type='credit',
                    transaction_line_method='sale',
                    transaction_line_amount=sale.total_amount,
                    transaction_line_description=f'Sale transaction for {sale.sale_number}',
                    is_active=True,
                )
                
                return transaction_obj
                
        except Exception as e:
            # Log the error but don't fail the main operation
            print(f"Error creating transaction for sale {sale.id}: {str(e)}")
            return None

    @staticmethod
    def transaction_create_or_update_receipt(receipt):
        """
        Create Transaction and TransactionLine for a Receipt.
        
        When a Receipt is created, a Transaction and its corresponding TransactionLine should also be created.
        
        Args:
            receipt: Receipt instance
        """
        try:
            with db_transaction.atomic():
                # Get customer from the job order if available
                # If job_order doesn't exist or doesn't have customer, customer can be null
                customer = None
                try:
                    if receipt.job_order and receipt.job_order.customer:
                        customer = receipt.job_order.customer
                except Exception:
                    pass
                
                # Create Transaction for this Receipt (customer can be null)
                transaction_obj = Transaction.objects.create(
                    customer=customer,  # Can be None
                    receipt=receipt,
                    job_order=receipt.job_order if receipt.job_order else None,  # Also link to job order if available
                    transaction_id=TransactionViewSet.generate_transaction_id(),
                    transaction_method='receipt',
                    transaction_amount=receipt.receipt_amount,
                    transaction_date=receipt.receipt_date,
                    transaction_status='completed',
                    transaction_remarks=receipt.receipt_remarks or f'Transaction for Receipt {receipt.receipt_id}',
                    is_active=True,
                )
                
                # Create TransactionLine for the receipt amount
                job_order_ref = receipt.job_order.job_order_number if receipt.job_order else 'N/A'
                TransactionLine.objects.create(
                    transaction=transaction_obj,
                    transaction_line_type='credit',
                    transaction_line_method='receipt',
                    transaction_line_amount=receipt.receipt_amount,
                    transaction_line_description=f'Receipt transaction for {receipt.receipt_id} - Job Order {job_order_ref}',
                    is_active=True,
                )
                
                return transaction_obj
                
        except Exception as e:
            # Log the error but don't fail the main operation
            print(f"Error creating transaction for receipt {receipt.id}: {str(e)}")
            return None

    @action(detail=False, methods=['get'], url_path='daily-report')
    def daily_report(self, request):
        """
        Get daily cash flow report for a specific date.
        
        Query params:
        - date: Date in YYYY-MM-DD format (default: today)
        
        Returns:
        - cashIn: advanceOnOrder, delivery, cashOnSales, receipt, otherCashIn, total
        - cashOut: cashOutExp, total
        - netCash
        - summary: totalJobOrder, totalSales, totalBusiness
        """
        try:
            # Get date from query params or use today
            date_str = request.query_params.get('date', None)
            if date_str:
                try:
                    target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                except ValueError:
                    return Response(
                        {'error': 'Invalid date format. Use YYYY-MM-DD'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                target_date = timezone.now().date()
            
            # Get start and end of day
            start_datetime = timezone.make_aware(datetime.combine(target_date, datetime.min.time()))
            end_datetime = timezone.make_aware(datetime.combine(target_date, datetime.max.time()))
            
            # Get TransactionLines for the date
            transaction_lines = TransactionLine.objects.filter(
                transaction__transaction_date__gte=start_datetime,
                transaction__transaction_date__lte=end_datetime,
                is_active=True
            )
            
            # Calculate cash in from TransactionLines
            advance_on_order = transaction_lines.filter(
                transaction_line_method='job_order_advance'
            ).aggregate(total=Sum('transaction_line_amount'))['total'] or 0
            
            delivery = transaction_lines.filter(
                transaction_line_method='job_order_delivery'
            ).aggregate(total=Sum('transaction_line_amount'))['total'] or 0
            
            cash_on_sales = transaction_lines.filter(
                transaction_line_method='sale'
            ).aggregate(total=Sum('transaction_line_amount'))['total'] or 0
            
            receipt = transaction_lines.filter(
                transaction_line_method='receipt'
            ).aggregate(total=Sum('transaction_line_amount'))['total'] or 0
            
            other_cash_in = 0  # Placeholder for future use
            
            total_cash_in = advance_on_order + delivery + cash_on_sales + receipt + other_cash_in
            
            # Cash out (placeholder for future use)
            cash_out_exp = 0
            total_cash_out = cash_out_exp
            
            # Net cash
            net_cash = total_cash_in - total_cash_out
            
            # Summary - Get totals from JobOrders and Sales for the date
            job_orders = JobOrder.objects.filter(
                created_at__date=target_date,
                is_active=True
            )
            total_job_order = job_orders.aggregate(
                total=Sum('total_amount')
            )['total'] or 0
            
            sales = Sale.objects.filter(
                date__date=target_date,
                is_active=True
            )
            total_sales = sales.aggregate(
                total=Sum('total_amount')
            )['total'] or 0
            
            total_business = total_job_order + total_sales
            
            # Format date for display
            date_display = target_date.strftime('%d-%m-%Y')
            weekday = target_date.strftime('%A')
            date_formatted = f"{date_display} {weekday}"
            
            response_data = {
                'date': date_formatted,
                'cashIn': {
                    'advanceOnOrder': float(advance_on_order),
                    'delivery': float(delivery),
                    'cashOnSales': float(cash_on_sales),
                    'receipt': float(receipt),
                    'otherCashIn': float(other_cash_in),
                    'total': float(total_cash_in)
                },
                'cashOut': {
                    'cashOutExp': float(cash_out_exp),
                    'total': float(total_cash_out)
                },
                'netCash': float(net_cash),
                'summary': {
                    'totalJobOrder': float(total_job_order),
                    'totalSales': float(total_sales),
                    'totalBusiness': float(total_business)
                }
            }
            
            return Response(response_data)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate daily report: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='monthly-report')
    def monthly_report(self, request):
        """
        Get monthly report data for a specific year.
        
        Query params:
        - year: Year in YYYY format (default: current year)
        
        Returns:
        - Array of monthly data with: month, advance, delivery, sales, receipt, total
        """
        try:
            # Get year from query params or use current year
            year_str = request.query_params.get('year', None)
            if year_str:
                try:
                    target_year = int(year_str)
                except ValueError:
                    return Response(
                        {'error': 'Invalid year format. Use YYYY'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                target_year = timezone.now().year
            
            # Validate year
            if target_year < 2000 or target_year > 2100:
                return Response(
                    {'error': 'Year must be between 2000 and 2100'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            monthly_data = []
            month_names = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ]
            
            for month_num in range(1, 13):
                # Get start and end of month
                start_date = datetime(target_year, month_num, 1).date()
                if month_num == 12:
                    end_date = datetime(target_year + 1, 1, 1).date() - timedelta(days=1)
                else:
                    end_date = datetime(target_year, month_num + 1, 1).date() - timedelta(days=1)
                
                start_datetime = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
                end_datetime = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
                
                # Get TransactionLines for the month
                transaction_lines = TransactionLine.objects.filter(
                    transaction__transaction_date__gte=start_datetime,
                    transaction__transaction_date__lte=end_datetime,
                    is_active=True
                )
                
                # Calculate amounts by method
                advance = transaction_lines.filter(
                    transaction_line_method='job_order_advance'
                ).aggregate(total=Sum('transaction_line_amount'))['total'] or 0
                
                delivery = transaction_lines.filter(
                    transaction_line_method='job_order_delivery'
                ).aggregate(total=Sum('transaction_line_amount'))['total'] or 0
                
                sales = transaction_lines.filter(
                    transaction_line_method='sale'
                ).aggregate(total=Sum('transaction_line_amount'))['total'] or 0
                
                receipt = transaction_lines.filter(
                    transaction_line_method='receipt'
                ).aggregate(total=Sum('transaction_line_amount'))['total'] or 0
                
                total = advance + delivery + sales + receipt
                
                monthly_data.append({
                    'month': month_names[month_num - 1],
                    'advance': float(advance),
                    'delivery': float(delivery),
                    'sales': float(sales),
                    'receipt': float(receipt),
                    'total': float(total)
                })
            
            return Response(monthly_data)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate monthly report: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
