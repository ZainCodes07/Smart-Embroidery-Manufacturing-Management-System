from django.db import models

class Designs(models.Model):
    designid = models.AutoField(db_column='DesignID', primary_key=True)  # Field name made lowercase.
    partycode = models.CharField(db_column='PartyCode', max_length=2, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    designnumber = models.CharField(db_column='DesignNumber', max_length=30, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    designcode = models.CharField(db_column='DesignCode', max_length=33, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    description = models.CharField(db_column='Description', max_length=250, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    isactive = models.BooleanField(db_column='IsActive')  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Designs'
        unique_together = (('partycode', 'designnumber'),)

