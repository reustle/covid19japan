
This is a very early draft of a backend

``` bash
# Once
pipenv install
pipenv run python manage.py loaddata fixtures.json


# Every time
pipenv run python manage.py runserver 0.0.0.0:8000


# Make migrations
pipenv run python manage.py makemigrations
pipenv run python manage.py sqlmigrate patients 00XX #(from prevoius command)
pipenv run python manage.py migrate

```


# Todo
- patient change logs
- locations - shouldnt be tied to patients?
