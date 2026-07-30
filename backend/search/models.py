from django.db import models

class SavedItem(models.Model):
    ITEM_TYPES = (
        ('user', 'User'),
        ('repo', 'Repository'),
    )
    PROVIDERS = (
        ('github', 'GitHub'),
        ('gitlab', 'GitLab'),
    )

    item_id = models.CharField(max_length=255)
    item_type = models.CharField(max_length=10, choices=ITEM_TYPES)
    provider = models.CharField(max_length=10, choices=PROVIDERS)
    title = models.CharField(max_length=255)
    url = models.URLField()
    avatar_url = models.URLField(blank=True, null=True)
    # store star count for repositories when available
    star_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('item_id', 'provider', 'item_type')

    def __str__(self):
        return f"[{self.provider}] {self.item_type}: {self.title}"