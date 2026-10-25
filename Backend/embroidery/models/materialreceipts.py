from django.db import models

class Materialreceipts(models.Model):
    receiptid = models.AutoField(db_column='ReceiptID', primary_key=True)  # Field name made lowercase.
    receiptdate = models.DateField(db_column='ReceiptDate')  # Field name made lowercase.
    receipttype = models.CharField(db_column='ReceiptType', max_length=10, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    supplierid = models.ForeignKey('Suppliers', models.DO_NOTHING, db_column='SupplierID', blank=True, null=True)  # Field name made lowercase.
    billnumber = models.CharField(db_column='BillNumber', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    notes = models.CharField(db_column='Notes', max_length=500, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MaterialReceipts'

