import sqlite3
import json
from pathlib import Path

def export_database_data():
    # Connect to your database
    db_path = Path(__file__).parent / 'instance' / 'kidasie.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Dictionary to store all data
    all_data = {}

    # Export users
    cursor.execute("SELECT * FROM user")
    users = cursor.fetchall()
    all_data['users'] = [
        {
            'id': row[0],
            'email': row[1],
            'password': row[2],
            'first_name': row[3],
            'last_name': row[4],
            'role': row[5],
            'teacher_id': row[6]
        } for row in users
    ]

    # Export songs
    cursor.execute("SELECT * FROM song")
    songs = cursor.fetchall()
    all_data['songs'] = [
        {
            'id': row[0],
            'title': row[1],
            'artist': row[2],
            'file_path': row[3]
        } for row in songs
    ]

    # Export recordings
    cursor.execute("SELECT * FROM recording")
    recordings = cursor.fetchall()
    all_data['recordings'] = [
        {
            'id': row[0],
            'user_id': row[1],
            'song_id': row[2],
            'file_path': row[3]
        } for row in recordings
    ]

    conn.close()

    # Print the data
    print("\n=== Current Database Content ===")
    print("\nUSERS:")
    for user in all_data['users']:
        print(f"ID: {user['id']}, Name: {user['first_name']} {user['last_name']}, Role: {user['role']}, Email: {user['email']}")
    
    print("\nSONGS:")
    for song in all_data['songs']:
        print(f"ID: {song['id']}, Title: {song['title']}, Artist: {song['artist']}")
    
    print("\nRECORDINGS:")
    for rec in all_data['recordings']:
        print(f"ID: {rec['id']}, User ID: {rec['user_id']}, Song ID: {rec['song_id']}")

    # Save to a JSON file
    with open('database_content.json', 'w') as f:
        json.dump(all_data, f, indent=2)
    
    print("\nData has been exported to 'database_content.json'")

if __name__ == "__main__":
    export_database_data()