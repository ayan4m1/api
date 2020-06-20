alter table flavors_ingredients add ingredient_category_id int default null;
alter table flavors_ingredients add constraint fk3_flavors_ingredients foreign key (ingredient_category_id) references ingredient_category (id);
