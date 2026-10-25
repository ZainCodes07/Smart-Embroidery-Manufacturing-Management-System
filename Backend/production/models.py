from django.db import models


class Machines(models.Model):
    machineid = models.AutoField(db_column='MachineID', primary_key=True)
    machinenumber = models.IntegerField(db_column='MachineNumber', unique=True)
    machinename = models.CharField(db_column='MachineName', max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    headcount = models.IntegerField(db_column='HeadCount')
    isactive = models.BooleanField(db_column='IsActive', default=True)
    createdat = models.DateTimeField(db_column='CreatedAt', auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'Machines'
        verbose_name = 'Machine'
        verbose_name_plural = 'Machines'

    def __str__(self):
        return f"Machine {self.machinenumber} ({self.machinename or ''})"


class Designs(models.Model):
    designid = models.AutoField(db_column='DesignID', primary_key=True)
    partycode = models.CharField(db_column='PartyCode', max_length=2, db_collation='SQL_Latin1_General_CP1_CI_AS')
    designnumber = models.CharField(db_column='DesignNumber', max_length=30, db_collation='SQL_Latin1_General_CP1_CI_AS')
    designcode = models.GeneratedField(
        expression=models.F('partycode'),
        output_field=models.CharField(max_length=33),
        db_persist=True,
        db_column='DesignCode'
    )
    description = models.CharField(db_column='Description', max_length=250, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    isactive = models.BooleanField(db_column='IsActive', default=True)
    createdat = models.DateTimeField(db_column='CreatedAt', auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'Designs'
        unique_together = (('partycode', 'designnumber'),)
        verbose_name = 'Design'
        verbose_name_plural = 'Designs'

    def __str__(self):
        return f"{self.designcode} ({self.partycode}-{self.designnumber})"


class Productionshifts(models.Model):
    productionshiftid = models.AutoField(db_column='ProductionShiftID', primary_key=True)
    machineid = models.ForeignKey(Machines, models.DO_NOTHING, db_column='MachineID')
    shiftdate = models.DateField(db_column='ShiftDate')
    shifttype = models.CharField(db_column='ShiftType', max_length=5, db_collation='SQL_Latin1_General_CP1_CI_AS')
    notes = models.CharField(db_column='Notes', max_length=250, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    createdat = models.DateTimeField(db_column='CreatedAt', auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'ProductionShifts'
        unique_together = (('machineid', 'shiftdate', 'shifttype'),)
        verbose_name = 'Production Shift'
        verbose_name_plural = 'Production Shifts'

    def __str__(self):
        return f"Shift #{self.productionshiftid} - Machine {self.machineid_id} ({self.shiftdate} {self.shifttype})"


class Productiondetails(models.Model):
    productiondetailid = models.AutoField(db_column='ProductionDetailID', primary_key=True)
    productionshiftid = models.ForeignKey(Productionshifts, models.DO_NOTHING, db_column='ProductionShiftID', related_name='details')
    designid = models.ForeignKey(Designs, models.DO_NOTHING, db_column='DesignID')
    parttype = models.CharField(db_column='PartType', max_length=10, db_collation='SQL_Latin1_General_CP1_CI_AS')
    stitchcount = models.BigIntegerField(db_column='StitchCount')
    mirrorcountperhead = models.IntegerField(db_column='MirrorCountPerHead')
    headcountused = models.IntegerField(db_column='HeadCountUsed')
    totalmirrors = models.GeneratedField(
        expression=models.F('mirrorcountperhead'),
        output_field=models.IntegerField(),
        db_persist=True,
        db_column='TotalMirrors'
    )
    createdat = models.DateTimeField(db_column='CreatedAt', auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'ProductionDetails'
        unique_together = (('productionshiftid', 'designid', 'parttype'),)
        verbose_name = 'Production Detail'
        verbose_name_plural = 'Production Details'

    def __str__(self):
        return f"Detail #{self.productiondetailid} ({self.parttype})"
