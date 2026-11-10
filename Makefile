
up:
	docker compose up -d --build

build:
	mvn clean package -DskipTests

down:
	docker compose down

logs:
	docker compose logs -f

db:
	docker compose exec -it postgres psql -U postgres -d store_db

clean:
	docker compose down -v

re: clean up

.PHONY: build up down logs db clean