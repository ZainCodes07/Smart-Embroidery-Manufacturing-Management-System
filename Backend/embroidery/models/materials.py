from django.db import models

class Materials(models.Model):
    materialid = models.AutoField(db_column='MaterialID', primary_key=True)  # Field name made lowercase.
    materialname = models.CharField(db_column='MaterialName', max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    variant = models.CharField(db_column='Variant', max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    category = models.CharField(db_column='Category', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    baseunit = models.CharField(db_column='BaseUnit', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    isactive = models.BooleanField(db_column='IsActive')  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Materials'
        unique_together = (('materialname', 'variant'),)

