import phonenumbers
from phonenumbers import geocoder
p= phonenumbers.parse("+919908238924")
print(geocoder.description_for_number(p,"en"))