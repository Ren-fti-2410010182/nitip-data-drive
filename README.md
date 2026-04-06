# Nitip Data Drive (NDD)

 Nitip Data Drive

Project cloud storage sederhana berbasis PHP

## Fitur
- Upload file
- Download file
- Distributed storage (node)

## Cara Menjalankan
1. Copy ke htdocs
2. Jalankan XAMPP
3. Akses localhost

## Flow Sistem

        ┌─────────────┐
        │    USER     │
        └─────┬───────┘
              ↓
     ┌─────────────────┐
     │  CLIENT-SIDE    │
     │ (HTML, JS, CSS) │
     └─────┬───────────┘
           ↓
     ┌─────────────────┐
     │  SERVER-SIDE    │
     │     (PHP)       │
     └─────┬───────────┘
           ↓
   ┌───────────────┬───────────────┐
   ↓               ↓               ↓
[Node1]        [Node2]        [Node3]
(Storage)     (Storage)     (Storage)

           ↓
     ┌─────────────┐
     │  DATABASE   │
     │   (MySQL)   │
     └─────────────┘
