from django.db import models

class Suppliers(models.Model):
    supplierid = models.AutoField(db_column='SupplierID', primary_key=True)  # Field name made lowercase.
    suppliername = models.CharField(db_column='SupplierName', unique=True, max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    phone = models.CharField(db_column='Phone', max_length=30, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    address = models.CharField(db_column='Address', max_length=250, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    isactive = models.BooleanField(db_column='IsActive')  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Suppliers'

