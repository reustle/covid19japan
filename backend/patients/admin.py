from django.contrib import admin
from .models import *


admin.site.register(PatientSource)
admin.site.register(PatientLocation)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'notes',
    )
    list_display_links = (
        'id',
    )
    list_filter = (
        #Prefecture,
    )


@admin.register(Prefecture)
class PrefectureAdmin(admin.ModelAdmin):
    list_display = (
        'label', 'label_ja',
    )
    list_display_links = (
        'label', 'label_ja',
    )
    ordering = (
        'label',
    )
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(PatientStatus)
class PatientStatusAdmin(admin.ModelAdmin):
    list_display = (
        'label', 'label_ja',
    )
    list_display_links = (
        'label', 'label_ja',
    )
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(PatientOrigin)
class PatientOriginAdmin(admin.ModelAdmin):
    list_display = (
        'label', 'label_ja',
    )
    list_display_links = (
        'label', 'label_ja',
    )
    
    def has_add_permission(self, request, obj=None):
        return False
