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

# old - STARTER_ELEMS = ["001", "002", "003"]
STARTER_ELEMS = ["183", "564", "159", "001"] 

db = SQLAlchemy(app)
# Admin page
admin = Admin(app, url='/admin')

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    #discoveries = db.relationship('Discovered', back_populates='user', lazy=True)
    discovered = db.Column(JSON, nullable=False, default=list)
    workspace = db.Column(JSON, nullable=False, default=list)
    achievements = db.Column(JSON, nullable=False, default=list)
    
class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    achievementName = db.Column(db.String(100), nullable=False)
    achievementDescription = db.Column(db.String(100), nullable = False)

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
        newUser.discovered = STARTER_ELEMS.copy()
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

@app.route('/game/<username>/getWorkspace')
def getWorkspace(username):
    user = User.query.filter_by(username=username).first()
    return jsonify(user.workspace or [])

@app.route('/game/<username>/saveWorkspace', methods=["POST"])
def saveWorkspace(username):
    newWorkspace = request.get_json().get('workspace')

    if not isinstance(newWorkspace, list):
        return jsonify({'success': False, 'message': 'Invalid workspace list'}), 400
    
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    user.workspace = newWorkspace
    db.session.commit()

    return jsonify({'success': True, 'message': 'Workspace updated'})

# Get game data for user
@app.route('/game/<username>/getDiscoveredData')
def getDiscoveredData(username):
    user = User.query.filter_by(username=username).first()
    return jsonify(user.discovered or [])

# Add discovered item to Discovered table
@app.route('/game/<username>/addToDiscovered', methods=['POST'])
def addToDiscovered(username):
    data = request.get_json()
    new_discovered_list = data.get('discovered')

    if not isinstance(new_discovered_list, list):
        return jsonify({'success': False, 'message': 'Invalid discovered list'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    user.discovered = new_discovered_list
    db.session.commit()

    return jsonify({'success': True, 'message': 'Discovered list updated'})

# Get game data for user
@app.route('/game/<username>/getAchievements')
def getAchievements(username):
    user = User.query.filter_by(username=username).first()
    return jsonify(user.achievements or [])

# Add discovered item to Discovered table
@app.route('/game/<username>/saveAchievements', methods=['POST'])
def saveAchievements(username):
    data = request.get_json()
    newAchievementsList = data.get('achievements')

    if not isinstance(newAchievementsList, list):
        return jsonify({'success': False, 'message': 'Invalid achievement list'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    user.achievements = newAchievementsList
    db.session.commit()

    return jsonify({'success': True, 'message': 'Achievements list updated'})

# Get info from user for gamepanel
@app.route('/get')
def getUserInfo():
    return

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)