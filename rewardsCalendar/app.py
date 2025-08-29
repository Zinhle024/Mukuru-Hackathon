from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
from database import init_db, get_db_connection

app = Flask(__name__)
CORS(app)  

# Initialize database on startup
init_db()

# API endpoint to get student data
@app.route('/api/student/<int:student_id>', methods=['GET'])
def get_student(student_id):
    conn = get_db_connection()
    student = conn.execute(
        'SELECT * FROM students WHERE id = ?', 
        (student_id,)
    ).fetchone()
    conn.close()
    
    if student:
        return jsonify({
            'id': student['id'],
            'name': student['name'],
            'total_points': student['total_points']
        })
    else:
        return jsonify({'error': 'Student not found'}), 404

# API endpoint to add points
@app.route('/api/student/<int:student_id>/add-points', methods=['POST'])
def add_points(student_id):
    data = request.get_json()
    subject = data.get('subject')
    points = data.get('points', 0)
    
    # Validate input
    if not subject:
        return jsonify({'error': 'Subject is required'}), 400
    
    try:
        points = int(points)
    except ValueError:
        return jsonify({'error': 'Points must be a number'}), 400
    
    conn = get_db_connection()
    
    try:
        # Add points transaction
        conn.execute(
            'UPDATE students SET total_points = total_points + ? WHERE id = ?', 
            (points, student_id)
        )
        
        # Record the points transaction
        conn.execute(
            'INSERT INTO points (student_id, subject, points) VALUES (?, ?, ?)',
            (student_id, subject, points)
        )
        
        # Get updated total points
        student = conn.execute(
            'SELECT total_points FROM students WHERE id = ?', 
            (student_id,)
        ).fetchone()
        total_points = student['total_points']
        
        # Check for rewards
        earned_rewards = []
        reward_data = [
            (5, 'chocolate'),
            (15, '50_rands'),
            (30, '100_rands')
        ]
        
        for threshold, reward_type in reward_data:
            if total_points >= threshold:
                # Check if reward already earned
                existing = conn.execute(
                    'SELECT * FROM rewards WHERE student_id = ? AND reward_type = ?', 
                    (student_id, reward_type)
                ).fetchone()
                
                if not existing:
                    conn.execute(
                        'INSERT INTO rewards (student_id, reward_type, earned_at) VALUES (?, ?, ?)',
                        (student_id, reward_type, threshold)
                    )
                    earned_rewards.append(reward_type)
        
        conn.commit()
        
        # Get all earned rewards for response
        rewards = conn.execute(
            'SELECT reward_type FROM rewards WHERE student_id = ?', 
            (student_id,)
        ).fetchall()
        all_rewards = [reward['reward_type'] for reward in rewards]
        
        return jsonify({
            'success': True,
            'total_points': total_points,
            'earned_rewards': earned_rewards,
            'all_rewards': all_rewards
        })
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
        
    finally:
        conn.close()

# API endpoint to get student rewards
@app.route('/api/student/<int:student_id>/rewards', methods=['GET'])
def get_rewards(student_id):
    conn = get_db_connection()
    rewards = conn.execute(
        'SELECT reward_type, earned_at, timestamp FROM rewards WHERE student_id = ?', 
        (student_id,)
    ).fetchall()
    conn.close()
    
    reward_list = [
        {
            'type': reward['reward_type'],
            'earned_at': reward['earned_at'],
            'timestamp': reward['timestamp']
        } for reward in rewards
    ]
    
    return jsonify({'rewards': reward_list})

# API endpoint to get points history
@app.route('/api/student/<int:student_id>/points-history', methods=['GET'])
def get_points_history(student_id):
    conn = get_db_connection()
    points = conn.execute(
        'SELECT subject, points, timestamp FROM points WHERE student_id = ? ORDER BY timestamp DESC', 
        (student_id,)
    ).fetchall()
    conn.close()
    
    points_history = [
        {
            'subject': point['subject'],
            'points': point['points'],
            'timestamp': point['timestamp']
        } for point in points
    ]
    
    return jsonify({'points_history': points_history})

# API endpoint to reset points
@app.route('/api/student/<int:student_id>/reset', methods=['POST'])
def reset_points(student_id):
    conn = get_db_connection()
    
    try:
        # Reset points and clear history
        conn.execute(
            'UPDATE students SET total_points = 0 WHERE id = ?', 
            (student_id,)
        )
        conn.execute(
            'DELETE FROM points WHERE student_id = ?', 
            (student_id,)
        )
        conn.execute(
            'DELETE FROM rewards WHERE student_id = ?', 
            (student_id,)
        )
        
        conn.commit()
        
        return jsonify({
            'success': True, 
            'message': 'Points and rewards reset successfully',
            'total_points': 0
        })
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
        
    finally:
        conn.close()

# API endpoint to get student leaderboard
@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    conn = get_db_connection()
    students = conn.execute(
        'SELECT id, name, total_points FROM students ORDER BY total_points DESC LIMIT 10'
    ).fetchall()
    conn.close()
    
    leaderboard = [
        {
            'id': student['id'],
            'name': student['name'],
            'total_points': student['total_points']
        } for student in students
    ]
    
    return jsonify({'leaderboard': leaderboard})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
    