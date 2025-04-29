from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///Player.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(20), nullabe=False)

class Leaderboard(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    
class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    

# Login page
@app.route('/')
def index():
    return render_template('login.html')

# Attempt Login
@app.route('/', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    if (Student.query.filter_by(username=username, password=password).first() != None):
        return redirect(url_for('student_panel', username=username))
    elif (Teacher.query.filter_by(username=username, password=password).first() != None):
        return redirect(url_for('teacher_panel', username=username))
    elif (Admins.query.filter_by(username=username, password=password).first() != None):
        return redirect('/admin')
    flash('Invalid credentials')
    return render_template('login.html')

# Register user
@app.route('/register')

# Settings page
@app.route('/')
def settings():
    return render_template('settings.html')

# Leaderboard page
@app.route('/leaderboard')
def leaderboard():
    return render_template('leaderboard.html')

# Get leaderboard records
@app.route('/getLeaderboardRecords')
def getLeaderboardRecords():
    return

# Gamepanel page
def gamepanel():
    return render_template('gamepanel.html')

# Get info from user for gamepanel
@app.route('/get')
def getUserInfo():
    return



if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.config["SECRET_KEY"] = "secret"
    app.run(debug=True)
