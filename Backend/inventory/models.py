from django.db import models


class Suppliers(models.Model):
    supplierid = models.AutoField(db_column='SupplierID', primary_key=True)
    suppliername = models.CharField(db_column='SupplierName', unique=True, max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS')
    phone = models.CharField(db_column='Phone', max_length=30, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    address = models.CharField(db_column='Address', max_length=250, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    isactive = models.BooleanField(db_column='IsActive', default=True)
    createdat = models.DateTimeField(db_column='CreatedAt', auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'Suppliers'
        verbose_name = 'Supplier'
        verbose_name_plural = 'Suppliers'

    def __str__(self):
        return self.suppliername


class Materials(models.Model):
    materialid = models.AutoField(db_column='MaterialID', primary_key=True)
    materialname = models.CharField(db_column='MaterialName', max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS')
    variant = models.CharField(db_column='Variant', max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS')
    category = models.CharField(db_column='Category', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')
    baseunit = models.CharField(db_column='BaseUnit', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS')
    isactive = models.BooleanField(db_column='IsActive', default=True)
    createdat = models.DateTimeField(db_column='CreatedAt', auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'Materials'
        unique_together = (('materialname', 'variant'),)
        verbose_name = 'Material'
        verbose_name_plural = 'Materials'

    def __str__(self):
        return f"{self.materialname} ({self.variant})"


class Materialreceipts(models.Model):
    receiptid = models.AutoField(db_column='ReceiptID', primary_key=True)
    receiptdate = models.DateField(db_column='ReceiptDate')
    receipttype = models.CharField(db_column='ReceiptType', max_length=10, db_collation='SQL_Latin1_General_CP1_CI_AS')
    supplierid = models.ForeignKey(Suppliers, models.DO_NOTHING, db_column='SupplierID', blank=True, null=True)
    billnumber = models.CharField(db_column='BillNumber', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    notes = models.CharField(db_column='Notes', max_length=500, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    createdat = models.DateTimeField(db_column='CreatedAt', auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'MaterialReceipts'
        verbose_name = 'Material Receipt'
        verbose_name_plural = 'Material Receipts'

    def __str__(self):
        return f"Receipt #{self.receiptid} - {self.supplierid}"


class Materialreceiptlines(models.Model):
    receiptlineid = models.AutoField(db_column='ReceiptLineID', primary_key=True)
    receiptid = models.ForeignKey(Materialreceipts, models.DO_NOTHING, db_column='ReceiptID', related_name='lines')
    materialid = models.ForeignKey(Materials, models.DO_NOTHING, db_column='MaterialID')
    purchasequantity = models.DecimalField(db_column='PurchaseQuantity', max_digits=18, decimal_places=3)
    purchaseunit = models.CharField(db_column='PurchaseUnit', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS')
    conversionfactor = models.DecimalField(db_column='ConversionFactor', max_digits=18, decimal_places=3, default=1.0)
    unitrate = models.DecimalField(db_column='UnitRate', max_digits=18, decimal_places=2)
    basequantity = models.GeneratedField(
        expression=models.F('purchasequantity'),
        output_field=models.DecimalField(max_digits=18, decimal_places=3),
        db_persist=True,
        db_column='BaseQuantity'
    )
    linetotal = models.GeneratedField(
        expression=models.F('unitrate'),
        output_field=models.DecimalField(max_digits=18, decimal_places=2),
        db_persist=True,
        db_column='LineTotal'
    )
    notes = models.CharField(db_column='Notes', max_length=250, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'MaterialReceiptLines'
        verbose_name = 'Material Receipt Line'
        verbose_name_plural = 'Material Receipt Lines'

    def __str__(self):
        return f"Line #{self.receiptlineid} for Receipt #{self.receiptid_id}"


class Materialissues(models.Model):
    issueid = models.AutoField(db_column='IssueID', primary_key=True)
    issuedate = models.DateField(db_column='IssueDate')
    issuetype = models.CharField(db_column='IssueType', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS')
    machineid = models.ForeignKey('production.Machines', models.DO_NOTHING, db_column='MachineID')
    notes = models.CharField(db_column='Notes', max_length=500, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    createdat = models.DateTimeField(db_column='CreatedAt', auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'MaterialIssues'
        verbose_name = 'Material Issue'
        verbose_name_plural = 'Material Issues'

    def __str__(self):
        return f"Issue #{self.issueid} - Machine {self.machineid_id}"


class Materialissuelines(models.Model):
    issuelineid = models.AutoField(db_column='IssueLineID', primary_key=True)
    issueid = models.ForeignKey(Materialissues, models.DO_NOTHING, db_column='IssueID', related_name='lines')
    materialid = models.ForeignKey(Materials, models.DO_NOTHING, db_column='MaterialID')
    issuequantity = models.DecimalField(db_column='IssueQuantity', max_digits=18, decimal_places=3)
    notes = models.CharField(db_column='Notes', max_length=250, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'MaterialIssueLines'
        verbose_name = 'Material Issue Line'
        verbose_name_plural = 'Material Issue Lines'

    def __str__(self):
        return f"Issue Line #{self.issuelineid}"
