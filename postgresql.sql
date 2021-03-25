CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  mc_uuid CHAR(36) NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_mc_uuid ON players (mc_uuid);

INSERT INTO players (mc_uuid) VALUES ('745c1536-dfb6-4ee8-92c5-aab069e7b6b2');
INSERT INTO players (mc_uuid) VALUES ('2b07d1c4-f01c-4565-af09-85903870bbce');