from django.db import models
from django.conf import settings

class PatientOrigin(models.Model):
    """ Where did the patient originate from """
    
    label = models.CharField(max_length=30)
    label_ja = models.CharField(max_length=30)
    
    def __str__(self):
        return self.label


class Prefecture(models.Model):
    """ A list of prefectures """
    
    label = models.CharField(max_length=30)
    label_ja = models.CharField(max_length=30)

    def __str__(self):
        return self.label


class PatientLocation(models.Model):
    """ A location where a patient was or is now """
    
    city = models.CharField(max_length=100)
    prefecture = models.ForeignKey(Prefecture, on_delete=models.CASCADE)
    country = models.CharField(max_length=30)
    lat = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    
    def __str__(self):
        return f"{self.city}, {self.prefecture.label}"


class PatientStatus(models.Model):
    """ Possible patient statuses """
    
    label = models.CharField(max_length=30)
    label_ja = models.CharField(max_length=30)

    def __str__(self):
        return self.label



class Patient(models.Model):
    """ Details of a particular patient """
    
    announced_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='created_by_user', on_delete=models.SET_NULL, null=True, blank=True)
    modified_at = models.DateTimeField(auto_now=True)
    modified_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='modified_by_user', on_delete=models.SET_NULL, null=True, blank=True)
    age_bracket = models.IntegerField(blank=True, null=True, choices=[(None, ''), (0, '0-9'), (10, '10-19'), (20, '20-29'), (30, '30-39'), (40, '40-49'), (50, '50-59'), (60, '60-69'), (70, '70-79'), (80, '80-89'), (90, '90-99'), (100, '100+')])
    gender = models.CharField(max_length=1, blank=True, null=True, choices=[(None, ''), ('m', 'M'), ('f', 'F')])
    detected_location = models.ForeignKey(PatientLocation, related_name='detected_location_loc', on_delete=models.SET_NULL, blank=True, null=True)
    residing_location = models.ForeignKey(PatientLocation, related_name='residing_location_loc', on_delete=models.SET_NULL, blank=True, null=True)
    status = models.ForeignKey(PatientStatus, on_delete=models.SET_NULL, blank=True, null=True)
    related_patients = models.CharField(max_length=50, blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    origin = models.ForeignKey(PatientOrigin, on_delete=models.CASCADE)
    draft = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Patient {self.id}"



class DataSource(models.Model):
    """ Patient information sources """
    
    label = models.CharField(max_length=100)
    label_ja = models.CharField(max_length=100, null=True, blank=True)
    url = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.label


class PatientSource(models.Model):
    """ Information sources per patient """
    
    data_source = models.ForeignKey(DataSource, on_delete=models.SET_NULL, null=True, blank=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    source_id = models.IntegerField()
    url = models.URLField()
    
    def __str__(self):
        if self.data_source:
            return self.data_source.label
        else:
            return self.url

