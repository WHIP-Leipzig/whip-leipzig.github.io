dev:
	make start

setup:
	npm ci

start:
	npm run start

build:
	npm run build

cleanup:
	rm -rf node_modules

reset:
	make cleanup
	make setup

fresh:
	make cleanup 
	make setup