from django.db import models

class Machines(models.Model):
    machineid = models.AutoField(db_column='MachineID', primary_key=True)  # Field name made lowercase.
    machinenumber = models.IntegerField(db_column='MachineNumber', unique=True)  # Field name made lowercase.
    machinename = models.CharField(db_column='MachineName', max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    headcount = models.IntegerField(db_column='HeadCount')  # Field name made lowercase.
    isactive = models.BooleanField(db_column='IsActive')  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Machines'

