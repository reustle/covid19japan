from django.db import models
from django.contrib.auth import get_user_model
CustomUser = get_user_model()


class PatientOrigin(models.Model):
    """ Where did the patient originate from """
    
    label = models.CharField(max_length=30)
    label_ja = models.CharField(max_length=30)
    
    def __str__(self):
        return f"{self.label} ({self.label_ja})"


class Prefecture(models.Model):
    """ A list of prefectures """
    
    label = models.CharField(max_length=30)
    label_ja = models.CharField(max_length=30)
    
    def __str__(self):
        return f"{self.label} ({self.label_ja})"


class PatientLocation(models.Model):
    """ A location where a patient was or is now """
    
    city = models.CharField(max_length=100)
    prefecture = models.ForeignKey(Prefecture, on_delete=models.CASCADE)
    country = models.CharField(max_length=30)
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    
    def __str__(self):
        return f"{self.city}, {self.prefecture.label}"


class PatientStatus(models.Model):
    """ Possible patient statuses """
    
    label = models.CharField(max_length=30)
    label_ja = models.CharField(max_length=30)

    def __str__(self):
        return f"{self.label} ({self.label_ja})"


class Patient(models.Model):
    """ Details of a particular patient """
    
    draft = models.BooleanField(default=False)
    announced_at = models.DateTimeField()
    created_at = models.DateTimeField()
    created_by = models.ForeignKey(CustomUser, related_name='created_by_user', on_delete=models.CASCADE)
    modified_by = models.ForeignKey(CustomUser, related_name='modified_by_user', on_delete=models.CASCADE)
    age_bracket = models.IntegerField(null=True)
    gender = models.CharField(max_length=1, null=True)
    detected_location = models.ForeignKey(PatientLocation, related_name='detected_location_loc', on_delete=models.CASCADE)
    residing_location = models.ForeignKey(PatientLocation, related_name='residing_location_loc', on_delete=models.CASCADE)
    status = models.ForeignKey(PatientStatus, on_delete=models.CASCADE)
    related_patients = models.CharField(max_length=50)
    occupation = models.CharField(max_length=100)
    notes = models.TextField()
    origin = models.ForeignKey(PatientOrigin, on_delete=models.CASCADE)



class PatientSource(models.Model):
    """ Information sources per patient """
    
    label = models.CharField(max_length=100)
    label_ja = models.CharField(max_length=100)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    source_id = models.IntegerField()
    url = models.URLField()
    
    def __str__(self):
        return f"{self.label} ({self.label_ja})"
