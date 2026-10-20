from django.db import models
from .machines import Machines
class Materialissues(models.Model):
    issueid = models.AutoField(db_column='IssueID', primary_key=True)  # Field name made lowercase.
    issuedate = models.DateField(db_column='IssueDate')  # Field name made lowercase.
    issuetype = models.CharField(db_column='IssueType', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    notes = models.CharField(db_column='Notes', max_length=500, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.
    machineid = models.ForeignKey('embroidery.Machines', models.DO_NOTHING, db_column='MachineID')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MaterialIssues'

