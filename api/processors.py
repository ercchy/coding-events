import datetime
from models.events import Event


def get_all_events():
	return Event.objects.all()


def get_event_by_id(event_id):
	event = Event.objects.get(id=event_id)
	return event


def get_approved_events(limit=None, order=None, country_code=None, past=False):
	"""
	Select all events which are approved and optionally limit and/or order them
	"""

	events = Event.objects.filter(status='APPROVED')
	if not past:
		events = events.filter(end_date__gte=datetime.datetime.now())
	if country_code:
		events = events.filter(country=country_code)
	if order:
		events = events.order_by(order)
	if limit:
		events = events[:limit]

	return events


def get_pending_events(limit=None, order=None, country_code=None, past=False):

	"""
	Select all future or past events which are pending and optionally limit and/or order them
	"""

	events = Event.objects.filter(status='PENDING')
	if not past:
		events = events.filter(end_date__gte=datetime.datetime.now())
	if country_code:
		events = events.filter(country=country_code)
	if order:
		events = events.order_by(order)
	if limit:
		events = events = events[:limit]

	return events