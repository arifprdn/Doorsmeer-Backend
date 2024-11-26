from eralchemy import render_er

# Define the schema in a simplified way for ERD
prisma_schema = """
entity DoorsmeerStatus {
    id int [pk]
    isOpen boolean
    updatedAt datetime
}

entity Admin {
    user_id int [pk]
    username string
    password string
}

entity Antrian {
    id int [pk]
    namaKendaraan string
    nomorPolisi string
    status enum
    createdAt datetime
    updatedAt datetime
    EditedBy string
    transaksiId int [unique, ref: > Transaksi.payment_id]
}

entity Jasa {
    id int [pk]
    namaJasa string
    harga float
    createdAt datetime
    updatedAt datetime
    transaksiId int [unique, ref: > Transaksi.payment_id]
}

entity Transaksi {
    payment_id int [pk]
    payment_type string
    payment_date datetime
    total_price float
}

Antrian.transaksiId > Transaksi.payment_id
Jasa.transaksiId > Transaksi.payment_id
"""

# Generate ERD
output_path = "erd_transaksi_antrian_jasa.pdf"
render_er(prisma_schema, output_path)