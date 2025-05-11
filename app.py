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

STARTER_ELEMS = ["183", "564", "159", "001"]
# STARTER_ELEMS = ["000","001","002","003","004","005","006","007","008","009","010","011","012","013","014","015","016","017","018","020","021","022","023","024","025","026","027","028","029","030","031","032","033","034","035","036","037","038","039","040","041","042","043","044","045","046","047","048","049","050","051","052","053","054","055","056","057","058","059","060","061","062","063","064","065","066","067","068","069","070","071","072","073","074","075","076","077","078","079","080","081","082","083","084","085","086","087","088","089","090","091","092","093","094","095","096","097","098","099","100","101","102","103","104","105","106","107","108","109","110","111","112","113","114","115","116","117","118","119","120","121","122","123","124","125","126","127","128","129","130","131","132","133","134","135","136","137","138","139","140","141","142","143","144","146","148","149","150","151","152","153","154","155","156","157","158","159","160","161","162","163","164","165","166","167","168","169","170","171","172","173","174","175","176","177","178","179","180","181","182","183","184","185","186","187","188","189","190","191","192","193","194","195","196","197","198","199","200","201","202","203","204","205","206","207","208","209","210","211","212","213","214","215","216","217","218","219","220","221","222","223","224","225","226","227","228","229","230","231","232","233","234","235","236","237","238","239","240","241","242","243","244","245","246","247","248","249","250","251","252","253","254","255","256","257","258","259","260","261","262","263","264","265","266","267","268","269","270","271","272","273","274","275","276","277","278","279","280","281","282","283","284","285","286","287","288","289","290","291","292","293","294","295","296","297","298","299","300","301","302","303","304","305","306","307","308","309","310","311","312","313","314","315","316","317","318","319","320","321","322","323","324","325","326","327","328","329","330","331","332","333","334","335","336","337","338","339","340","341","342","343","344","345","346","347","348","349","350","351","352","353","354","355","356","357","358","359","360","361","362","363","364","365","366","367","368","369","370","371","372","373","374","375","376","377","378","379","380","381","382","383","384","385","386","387","388","389","390","391","392","393","394","395","396","397","398","399","400","401","402","403","404","405","406","407","408","409","410","411","412","413","414","415","416","417","418","419","420","421","422","423","424","425","426","427","428","429","430","431","432","433","434","435","436","437","438","439","440","441","442","443","444","445","446","447","448","449","450","451","452","453","454","455","456","457","458","459","460","461","462","463","464","465","466","467","468","469","470","471","472","473","474","475","476","477","478","479","480","481","482","483","484","485","486","487","488","489","490","491","492","493","494","495","496","497","498","499","500","501","502","503","504","505","506","507","508","509","510","511","512","513","514","515","516","517","518","519","520","521","522","523","524","525","526","527","528","529","530","531","532","533","534","535","536","537","538","539","540","541","542","543","544","545","546","547","548","549","550","551","552","553","554","555","556","557","558","559","560","561","562","563","564","565","567","568","569","570","571","572","573","574","575","576","577","578","579","580","581","582","583","584","585","586","587","588","589","590","591","592","593","594","595","596","597"]

db = SQLAlchemy(app)
# Admin page
admin = Admin(app, url='/admin')

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)