# Generated by Django 2.2.4 on 2019-08-29 21:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("api", "0010_task_branch_name")]

    operations = [
        migrations.AlterField(
            model_name="project", name="branch_name", field=models.SlugField(null=True)
        ),
        migrations.AlterField(
            model_name="task", name="branch_name", field=models.SlugField(null=True)
        ),
    ]
