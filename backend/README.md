### Running Locally

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


### Todo
- Patient change logs (full change history per patient)
- Create publicly viewable table, sum by day?
- Set up Django Rest Framework json endpoint(s)
- How do we handle unspecified deaths? critical? etc?
- New MODEL for # of tests performed
- Codify user auth group for data entry folks
- Account creation request
- Public comments? (suggest a change)
