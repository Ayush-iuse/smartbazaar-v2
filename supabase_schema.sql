
CREATE TABLE background_jobs (
	id SERIAL NOT NULL, 
	job_type VARCHAR NOT NULL, 
	payload TEXT NOT NULL, 
	status VARCHAR NOT NULL, 
	error TEXT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	scheduled_at TIMESTAMP WITHOUT TIME ZONE, 
	completed_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
)

;


CREATE TABLE system_settings (
	key VARCHAR NOT NULL, 
	value TEXT NOT NULL, 
	description VARCHAR, 
	PRIMARY KEY (key)
)

;


CREATE TABLE users (
	id SERIAL NOT NULL, 
	email VARCHAR NOT NULL, 
	full_name VARCHAR, 
	hashed_password VARCHAR NOT NULL, 
	is_admin BOOLEAN, 
	is_suspended BOOLEAN, 
	preferred_language VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
)

;


CREATE TABLE audit_logs (
	id SERIAL NOT NULL, 
	user_id INTEGER, 
	action VARCHAR NOT NULL, 
	entity_type VARCHAR, 
	entity_id INTEGER, 
	details TEXT, 
	ip_address VARCHAR, 
	user_agent VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL
)

;


CREATE TABLE listings (
	id SERIAL NOT NULL, 
	title VARCHAR NOT NULL, 
	description TEXT, 
	price FLOAT NOT NULL, 
	category VARCHAR NOT NULL, 
	location VARCHAR NOT NULL, 
	image_urls TEXT, 
	seller_id INTEGER NOT NULL, 
	fraud_score FLOAT, 
	fraud_level VARCHAR, 
	status VARCHAR NOT NULL, 
	is_featured BOOLEAN, 
	allow_sale BOOLEAN NOT NULL, 
	allow_rental BOOLEAN NOT NULL, 
	rental_price_per_day FLOAT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE CASCADE
)

;


CREATE TABLE login_histories (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	ip_address VARCHAR NOT NULL, 
	user_agent VARCHAR NOT NULL, 
	device_info VARCHAR, 
	status VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;


CREATE TABLE notifications (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	type VARCHAR NOT NULL, 
	title VARCHAR NOT NULL, 
	message TEXT NOT NULL, 
	is_read BOOLEAN NOT NULL, 
	is_archived BOOLEAN NOT NULL, 
	link VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;


CREATE TABLE saved_searches (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	query VARCHAR NOT NULL, 
	filters TEXT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;


CREATE TABLE conversations (
	id SERIAL NOT NULL, 
	listing_id INTEGER NOT NULL, 
	buyer_id INTEGER NOT NULL, 
	seller_id INTEGER NOT NULL, 
	is_archived_buyer BOOLEAN NOT NULL, 
	is_archived_seller BOOLEAN NOT NULL, 
	is_pinned_buyer BOOLEAN NOT NULL, 
	is_pinned_seller BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_listing_buyer_conversation UNIQUE (listing_id, buyer_id), 
	FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
	FOREIGN KEY(buyer_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE CASCADE
)

;


CREATE TABLE offers (
	id SERIAL NOT NULL, 
	listing_id INTEGER NOT NULL, 
	buyer_id INTEGER NOT NULL, 
	seller_id INTEGER NOT NULL, 
	offer_amount FLOAT NOT NULL, 
	status VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
	FOREIGN KEY(buyer_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE CASCADE
)

;


CREATE TABLE price_watches (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	listing_id INTEGER NOT NULL, 
	last_notified_price FLOAT NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE
)

;


CREATE TABLE rental_bookings (
	id SERIAL NOT NULL, 
	listing_id INTEGER NOT NULL, 
	buyer_id INTEGER NOT NULL, 
	start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	status VARCHAR NOT NULL, 
	total_cost FLOAT NOT NULL, 
	instant_book BOOLEAN, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
	FOREIGN KEY(buyer_id) REFERENCES users (id) ON DELETE CASCADE
)

;


CREATE TABLE rental_calendar (
	id SERIAL NOT NULL, 
	listing_id INTEGER NOT NULL, 
	date DATE NOT NULL, 
	status VARCHAR NOT NULL, 
	seasonal_price_override FLOAT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE
)

;


CREATE TABLE rental_listings (
	id SERIAL NOT NULL, 
	listing_id INTEGER NOT NULL, 
	rental_hourly_rate FLOAT, 
	rental_daily_rate FLOAT, 
	rental_weekly_rate FLOAT, 
	rental_monthly_rate FLOAT, 
	security_deposit FLOAT NOT NULL, 
	delivery_fee FLOAT, 
	cleaning_fee FLOAT, 
	insurance_fee FLOAT, 
	late_return_fee_rate FLOAT, 
	status VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE
)

;


CREATE TABLE messages (
	id SERIAL NOT NULL, 
	listing_id INTEGER NOT NULL, 
	sender_id INTEGER NOT NULL, 
	conversation_id INTEGER NOT NULL, 
	content TEXT, 
	message_type VARCHAR NOT NULL, 
	media_url VARCHAR, 
	is_delivered BOOLEAN NOT NULL, 
	is_read BOOLEAN NOT NULL, 
	reactions TEXT NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
	FOREIGN KEY(sender_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
)

;


CREATE TABLE online_status (
	user_id INTEGER NOT NULL, 
	is_online BOOLEAN NOT NULL, 
	last_active_at TIMESTAMP WITHOUT TIME ZONE, 
	current_conversation_id INTEGER, 
	PRIMARY KEY (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(current_conversation_id) REFERENCES conversations (id) ON DELETE SET NULL
)

;


CREATE TABLE rental_contracts (
	id SERIAL NOT NULL, 
	booking_id INTEGER NOT NULL, 
	terms_text TEXT NOT NULL, 
	signature_status BOOLEAN, 
	signed_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(booking_id) REFERENCES rental_bookings (id) ON DELETE CASCADE
)

;


CREATE TABLE rental_deposits (
	id SERIAL NOT NULL, 
	booking_id INTEGER NOT NULL, 
	amount_held FLOAT NOT NULL, 
	deduction_amount FLOAT, 
	status VARCHAR NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(booking_id) REFERENCES rental_bookings (id) ON DELETE CASCADE
)

;


CREATE TABLE rental_returns (
	id SERIAL NOT NULL, 
	booking_id INTEGER NOT NULL, 
	inspector_id INTEGER NOT NULL, 
	status VARCHAR NOT NULL, 
	damage_cost FLOAT, 
	inspection_notes TEXT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(booking_id) REFERENCES rental_bookings (id) ON DELETE CASCADE, 
	FOREIGN KEY(inspector_id) REFERENCES users (id) ON DELETE CASCADE
)

;


CREATE TABLE reports (
	id SERIAL NOT NULL, 
	reporter_id INTEGER NOT NULL, 
	reported_user_id INTEGER, 
	reported_listing_id INTEGER, 
	reported_conversation_id INTEGER, 
	reported_message_id INTEGER, 
	reason VARCHAR NOT NULL, 
	details TEXT, 
	status VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(reporter_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(reported_user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(reported_listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
	FOREIGN KEY(reported_conversation_id) REFERENCES conversations (id) ON DELETE CASCADE, 
	FOREIGN KEY(reported_message_id) REFERENCES messages (id) ON DELETE CASCADE
)

;