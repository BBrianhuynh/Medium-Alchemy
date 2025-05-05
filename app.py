from flask import Flask, render_template, request, redirect, url_for, jsonify, flash, session
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import JSON

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///Player.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
# Admin page
admin = Admin(app, url='/admin')

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(128), nullable=False)
    # discovered = db.Column(db.JSON, default=list)

class Leaderboard(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    
class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)

admin.add_view(ModelView(User, db.session))

# Login page
@app.route('/', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if (user and check_password_hash(user.password, password)):
            session['username'] = username
            return redirect(url_for('game', username=username))
        flash('Invalid credentials')
    return render_template('login.html')

# Register user page
@app.route('/register', methods=['GET','POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        retype_password = request.form['retype_password']
        if password != retype_password:
            flash("Passwords do not match.")
            return redirect(url_for('register'))
        user = User.query.filter_by(username=username).first()
        if user:
            flash("Username already exists.")
            return redirect(url_for('register'))
        hashedPassword = generate_password_hash(password)
        newUser = User(username=username, password=hashedPassword)
        db.session.add(newUser)
        db.session.commit()
        flash("Registration successful!")
        return redirect(url_for('login'))
    return render_template('register.html')

# Settings page
@app.route('/settings')
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

# Game page
@app.route('/game/<username>')
def game(username):
    return render_template('game.html')

@app.route('/game/<username>/getDiscovered')
def getDiscovered(username):
    return
# Get info from user for gamepanel
@app.route('/get')
def getUserInfo():
    return

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
