from django.db import models

class Materialreceiptlines(models.Model):
    receiptlineid = models.AutoField(db_column='ReceiptLineID', primary_key=True)  # Field name made lowercase.
    receiptid = models.ForeignKey('Materialreceipts', models.DO_NOTHING, db_column='ReceiptID')  # Field name made lowercase.
    materialid = models.ForeignKey('Materials', models.DO_NOTHING, db_column='MaterialID')  # Field name made lowercase.
    purchasequantity = models.DecimalField(db_column='PurchaseQuantity', max_digits=18, decimal_places=3)  # Field name made lowercase.
    purchaseunit = models.CharField(db_column='PurchaseUnit', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    conversionfactor = models.DecimalField(db_column='ConversionFactor', max_digits=18, decimal_places=3)  # Field name made lowercase.
    unitrate = models.DecimalField(db_column='UnitRate', max_digits=18, decimal_places=2)  # Field name made lowercase.
    basequantity = models.DecimalField(db_column='BaseQuantity', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    linetotal = models.DecimalField(db_column='LineTotal', max_digits=18, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    notes = models.CharField(db_column='Notes', max_length=250, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MaterialReceiptLines'

