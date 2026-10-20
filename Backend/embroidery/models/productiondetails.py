from django.db import models

class Productiondetails(models.Model):
    productiondetailid = models.AutoField(db_column='ProductionDetailID', primary_key=True)  # Field name made lowercase.
    productionshiftid = models.ForeignKey('Productionshifts', models.DO_NOTHING, db_column='ProductionShiftID')  # Field name made lowercase.
    designid = models.ForeignKey('embroidery.Designs', models.DO_NOTHING, db_column='DesignID')  # Field name made lowercase.
    parttype = models.CharField(db_column='PartType', max_length=10, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    stitchcount = models.BigIntegerField(db_column='StitchCount')  # Field name made lowercase.
    mirrorcountperhead = models.IntegerField(db_column='MirrorCountPerHead')  # Field name made lowercase.
    headcountused = models.IntegerField(db_column='HeadCountUsed')  # Field name made lowercase.
    totalmirrors = models.IntegerField(db_column='TotalMirrors', blank=True, null=True)  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ProductionDetails'
        unique_together = (('productionshiftid', 'designid', 'parttype'),)

