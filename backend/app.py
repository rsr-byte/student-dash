from flask import Flask,  jsonify,request,session,send_from_directory
import pandas as pd
import os
from dotenv import load_dotenv
from flask_cors import CORS
import numpy as np
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import bcrypt
from datetime import timedelta
from functools import wraps
import random
from flask_session import Session
# import pyotp
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import uuid

load_dotenv()


database = os.getenv("DATABASE")
# geca_mail=os.getenv("GECAEMAIL")
# app_password=os.getenv("APPPASSWORD")

# server = smtplib.SMTP('smtp.gmail.com', 587)
# server.starttls()
# server.login(geca_mail, app_password)


app = Flask(__name__)

CORS(app,supports_credentials=True)

app.secret_key = os.getenv("SECRETKEY")

app.config['SESSION_TYPE'] = 'filesystem'
app.static_folder = 'build'

app.config.update(
    SESSION_COOKIE_SAMESITE='Lax', 
    SESSION_COOKIE_SECURE=False,   
    SESSION_COOKIE_HTTPONLY=True,
    PERMANENT_SESSION_LIFETIME=timedelta(hours=1) 
)
Session(app)

uri = f"mongodb+srv://rajveer:{database}@college.wag2u.mongodb.net/?retryWrites=true&w=majority&appName=College"


client = MongoClient(uri, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)


db = client["GECA"]


def get_selected_collection():
    collection_name = request.cookies.get("collection_name")
  
    if not collection_name:
        raise ValueError("No collection selected")

    collection = db[collection_name]
    data = list(collection.find())
    df = pd.DataFrame(data)[["name", "rollno","semester","subject_grade_list","visibility","avatar"]]
   
    df.rename(columns={"rollno":"University Roll Number"},inplace=True)
   
    
    false_visibility_idx = df[df["visibility"] == False].index
 
    for i, idx in enumerate(false_visibility_idx):
        df.loc[idx, "name"] = f"STU{i+1}{random.randint(1,100)}"


    return df



def name_list():

    df=get_selected_collection()
    df=df[df["visibility"] == True]

    return df["name"].tolist()
   

def truncate(x, decimals=2):
    factor = 10 ** decimals
    return np.floor(x * factor) / factor

def extract_sgpa(df, semester_index):
    def get_sgpa(x):
        try:
            val = x[-2][semester_index]
            return float(val) if val.strip() != '' else None
        except (IndexError, ValueError):
            return None
    return df["semester"].apply(get_sgpa)


def classwiseplot(student_type):

    df=get_selected_collection()

    visible_counts=len(df[df["visibility"] == True]) 
    total_counts=len(df)   
    loop_start=0
    if student_type=="REAP":
        df=df[df["University Roll Number"].str.contains("24EEA")==False]
    else:
        df=df[df["University Roll Number"].str.contains("24EEA")]
        loop_start=2

    semester_figures = {}
    semester_info = {}
    
    for i in range(loop_start,8):
        
        sem_col = f"Semester {i+1}"
        
        def extract_sgpa(x):
            try:
                val = x[-2][i+1]  
                return float(val) if val.strip() != '' else None
            except (IndexError, ValueError):
                return None

        df[sem_col] = df["semester"].apply(extract_sgpa)
        
        sem_df = df[["name", sem_col]].dropna()
            
        if not sem_df.empty:
            semester_info[sem_col] = [
                sem_df[sem_col].max(),
                sem_df[sem_col].min(),
                round(sem_df[sem_col].mean(),2),
                sem_df.shape[0],
                df[["name", sem_col]].shape[0]
                ]
            sem_df = sem_df.sort_values(sem_col,ascending=False)

            semester_figures[sem_col]=sem_df.to_json(orient='records')


    def extract_cgpa(sem):
        
        if sem[5][3]=="":
            return None
        return float(sem[5][3])
        

    df["cgpa"] = df["semester"].apply(extract_cgpa)


    total_length=len(df)
    df.dropna(subset=["cgpa"], inplace=True)

   
    cgpa_df = df[["name", "cgpa"]]
    
    if not cgpa_df.empty:
        cgpa_df = cgpa_df.sort_values("cgpa", ascending=False)

        semester_info["CGPA"] = [
            cgpa_df["cgpa"].max(),
            cgpa_df["cgpa"].min(),
            round(cgpa_df["cgpa"].mean(),2),
            cgpa_df.shape[0],
            total_length
        ]


        semester_figures["CGPA"]=cgpa_df.to_json(orient="records")

    return semester_figures,semester_info,visible_counts,total_counts

def fetch_subject_name(idx):

    df=get_selected_collection()
    subject_grade_list = df["subject_grade_list"][idx]

    subject_df = pd.DataFrame()

    for key, grade_list in subject_grade_list.items():
        temp_df = pd.DataFrame(grade_list)
        temp_df["semester"] = key  
        subject_df = pd.concat([subject_df, temp_df], ignore_index=True)
    
    return subject_df[0].to_list(),subject_df[1].to_list()


def student_data(std_name,df):
    name = name_list()
    if std_name in name:
        idx=name.index(std_name)

        subject_df,grade_df = fetch_subject_name(idx)
       
        
        sgpa_list = []
        for sgpa in df["semester"][idx][-2]:
            sgpa_list.append(sgpa)

       
        avatar=df["avatar"][idx]
        return subject_df,grade_df,sgpa_list,avatar
    

def filter_student_with_subject_grades(student_row, subjects_to_match, grades_to_match):


    matched_subjects = []
    
    student_subject_grade_data = student_row.get("subject_grade_list")

    
    if not isinstance(student_subject_grade_data, dict):
        return None

    for semester_key, subject_list in student_subject_grade_data.items():
        
        if not isinstance(subject_list, list):
            continue

        for subject_entry in subject_list:
            
            if not isinstance(subject_entry, (list, tuple)) or len(subject_entry) < 2:
                continue

            subject_name = str(subject_entry[0]).strip()
            grade = str(subject_entry[1]).strip()

            if subject_name in subjects_to_match and grade in grades_to_match:
                matched_subjects.append((subject_name, grade))
    
    if matched_subjects:
        student_name = student_row.get("name", "Unknown Student")
        return {
            "name": student_name,
            "matched_subjects": matched_subjects
        }
    return None



def sanitize_input(data):
    if not isinstance(data,str):
        raise ValueError("Invalid input type")
    if data.startswith('$'):
        raise ValueError("Illegal query operator detected")
    return data


def verify_password(password, stored_hash):
    return bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8"))

# def create_sessions(username):
#     session_id=str(uuid.uuid4())
#     session_start=datetime.datetime.now()
#     expiry_time=datetime.datetime.now()+datetime.timedelta(minutes=30)
#     session_doc={
#         "_id":session_id,
#         "username":username,
#         "session_start":session_start,
#         "expires_at":expiry_time
#     }
#     sessions_collection.insert_one(session_doc)
#     return session_id


# def get_session(session_id):
#     session=sessions_collection.find_one({"_id":session_id})
#     if session and session["expires_at"]>datetime.datetime.now():
#         return session["username"]
#     else:
#         sessions_collection.delete_one({"_id":session_id})
#         return None

# def delete_session(session_id):
#     sessions_collection.delete_one({"_id": session_id})


def user_login(userLogin):
    
    user_collection = db["user"]

    username=sanitize_input(userLogin["username"])
    password=sanitize_input(userLogin["password"])
    
    user = user_collection.find_one({'username': username})
    if user:
        if verify_password(password, user["password"]):
            session.permanent=True
            session["username"] = username
            return "✅ Login successful"
        else:
            return "⚠️ Please check your password and try again"
    else:
        return "⚠️ Please check your username and password and try again"


def login_required(f):
    @wraps(f)
    def decorated_function(*args,**kwargs):
        if "username" not in session:
            return jsonify("Unauthorized")
        return f(*args,**kwargs)
    return decorated_function



@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path.startswith("api/"):
        return "Not found", 404
    
    file_path = os.path.join(app.static_folder, path)
    
    if os.path.exists(file_path) and not os.path.isdir(file_path):
        return send_from_directory(app.static_folder, path)
    else:
       
        return send_from_directory(app.static_folder, "index.html")




@app.route("/api/login",methods=["POST"])
def login():

    data = request.get_json()
    user = {
        "username": data["username"],
        "password": data["password"]
    }
    
    return [user_login(user),str(uuid.uuid4())]


# totp = pyotp.TOTP(pyotp.random_base32(),digits=6,interval=150)


# @app.route("/api/auth-otp",methods=["GET"])
# def genrate_otp():
 
#     user_collection = db["user"]
#     user = user_collection.find_one({"username":session["username"],"email": {"$exists": True}})
#     if user:
#         user_email = user["email"]
#         user_name=user["name"]

#         msg= MIMEMultipart()
#         msg["From"]=geca_mail
#         msg["To"]=user_email
#         msg["Subject"]="StudentDash: OTP Verification"

#         body=f"""<html>
#         <body>
#             <p>Hello, {user_name}</p>
#             <p>This is your OTP:</p>
#             <h2 style="color:#2E86C1;">{totp.now()}</h2>
#             <p>Please use this OTP to complete your verification.</p>
#             <p><strong>Note:</strong> Do not share this OTP with anyone.</p>
#             <br>
#             <p>Regards,<br>StudentDash Team</p>
#         </body>
#         </html>
#         """
#         msg.attach(MIMEText(body,"html"))
#         server.send_message(msg)

#         return "otp sent"

#     else:
#         return "user not exists"



# @app.route("/api/auth-otp",methods=["POST"])
# def verfiy_otp():
#     otp_req = request.get_json()

#     if totp.verify(otp_req["otp"]):
#         return ["OTP verified",str(uuid.uuid4())]
#     else:
#         return "OTP not verified"

@app.route("/api/home")
@login_required
def home():
    name = name_list()
    subject_df,grade_df = fetch_subject_name(0)
    return jsonify({"name":name,"subject":subject_df})



@app.route("/api/grade",methods=["POST"])
@login_required
def grade():

    std_name = request.get_data().decode('utf-8')
    students_df = get_selected_collection()
    students_df=students_df[students_df["name"].str.contains(r"\d")==False]
    subject_df,grade_df,cgpa,avatar = student_data(std_name,students_df)
    return [subject_df,grade_df,cgpa,avatar]


@app.route("/api/plots",methods=['GET'])
@login_required
def get_plots():
    semester_figures,semester_info,visible_counts,total_counts = classwiseplot("REAP")
    return jsonify({
        "graphs": semester_figures,
        "semester_info": semester_info,
        "visible_counts": visible_counts,
        "total_counts": total_counts
    })



@app.route("/api/reap_leep",methods=['POST'])
@login_required
def reap_leep_data():
   
    student=request.get_json()
    
    semester_figures,semester_info,visible_counts,total_counts = classwiseplot(student["student_type"])
    return jsonify({
        "graphs": semester_figures,
        "semester_info": semester_info,
        "visible_counts": visible_counts,
        "total_counts": total_counts
    })

   
    

@app.route("/api/subject_wise_performance", methods=["POST"])
@login_required
def subject_wise_performance():

    data = request.get_json()
    subjects = data["subjects"]
    grades = data["grades"]

    all_students_df = get_selected_collection()
    all_students_df=all_students_df[all_students_df["visibility"] == True]
    filtered_results = all_students_df.apply(
        lambda row: filter_student_with_subject_grades(row, subjects, grades), axis=1
    )
    
    final_filtered_students = filtered_results.dropna().tolist()
    
    if final_filtered_students:
        return jsonify(final_filtered_students)

    

@app.route("/api/profile")
@login_required
def user_profile():
    branch=session['username'][-5:-3]
    collection = db[branch]
    student=collection.find_one({"rollno":session['username']},{"_id":0,"name":1,"avatar":1,"visibility":1})
  
    return jsonify(student)
   



@app.route("/api/session")
@login_required
def check_session():

    return jsonify("Authorized")

@app.route("/api/logout")
@login_required
def logout():
    session.pop("username",None)
    session.clear()
    return jsonify("logout")

@app.route("/api/data_visibility",methods=['POST'])
@login_required
def data_visibility():

    req = request.get_json()
    branch=session['username'][-5:-3]
   

    db[branch].update_one(
            {"rollno": session['username']},
            {"$set": {"visibility": req["identity"]}}
            )
    
    return jsonify(req["identity"])




if __name__ == "__main__":
    app.run(debug=True)
