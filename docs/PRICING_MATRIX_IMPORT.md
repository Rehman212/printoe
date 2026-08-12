# Importing scraped variation prices

1. Run the Python exhaustive crawler and wait until its status is `complete`.
2. Open Admin → Products → Edit/Create product → Customer fields.
3. Click **Import pricing JSON** and select `*.printoe.json`.
4. Confirm the field and exact-price counts shown in green.
5. Click **Update** or **Save**. The UI uploads prices in 500-row chunks and only enables matrix pricing after the backend verifies the stored row count.

Do not use `Extra $` to reproduce UPrinting prices. Additive pricing cannot represent dependent combination pricing.
