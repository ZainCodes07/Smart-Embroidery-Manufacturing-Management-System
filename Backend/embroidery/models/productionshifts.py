from django.db import models

class Productionshifts(models.Model):
    productionshiftid = models.AutoField(db_column='ProductionShiftID', primary_key=True)  # Field name made lowercase.
    machineid = models.ForeignKey('embroidery.Machines', models.DO_NOTHING, db_column='MachineID')  # Field name made lowercase.
    shiftdate = models.DateField(db_column='ShiftDate')  # Field name made lowercase.
    shifttype = models.CharField(db_column='ShiftType', max_length=5, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    notes = models.CharField(db_column='Notes', max_length=250, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ProductionShifts'
        unique_together = (('machineid', 'shiftdate', 'shifttype'),)

