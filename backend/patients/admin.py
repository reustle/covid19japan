from django.contrib import admin
from .models import *


admin.site.register(PatientSource)
admin.site.register(PatientLocation)

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_fields = ('id', 'gender', 'age_bracket', 'occupation', 'notes')
    list_display = list_fields
    list_display_links = list_fields
    list_filter = (
        #'residing_location.prefecture',
    )
    readonly_fields = (
        'created_by', 'created_at', 'modified_at', 'modified_by',
    )
    
    def save_model(self, request, obj, form, change):
        print(request.user)
        if not obj.pk:
            obj.created_by = request.user
        obj.modified_by = request.user
        obj.save()


@admin.register(Prefecture)
class PrefectureAdmin(admin.ModelAdmin):
    list_fields = ('label', 'label_ja',)
    list_display = list_fields
    list_display_links = list_fields
    readonly_fields = list_fields
    ordering = ('label',)
    
    def has_add_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(PatientStatus)
class PatientStatusAdmin(admin.ModelAdmin):
    list_fields = ('label', 'label_ja',)
    list_display = list_fields
    list_display_links = list_fields
    readonly_fields = list_fields
    
    def has_add_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(PatientOrigin)
class PatientOriginAdmin(admin.ModelAdmin):
    list_fields = (
        'label', 'label_ja',
    )
    list_display = list_fields
    list_display_links = list_fields
    readonly_fields = list_fields
    
    def has_add_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
