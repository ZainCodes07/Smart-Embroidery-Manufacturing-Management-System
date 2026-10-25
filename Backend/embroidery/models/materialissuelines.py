from django.db import models

class Materialissuelines(models.Model):
    issuelineid = models.AutoField(db_column='IssueLineID', primary_key=True)  # Field name made lowercase.
    issueid = models.ForeignKey('Materialissues', models.DO_NOTHING, db_column='IssueID')  # Field name made lowercase.
    materialid = models.ForeignKey('Materials', models.DO_NOTHING, db_column='MaterialID')  # Field name made lowercase.
    issuequantity = models.DecimalField(db_column='IssueQuantity', max_digits=18, decimal_places=3)  # Field name made lowercase.
    notes = models.CharField(db_column='Notes', max_length=250, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MaterialIssueLines'

