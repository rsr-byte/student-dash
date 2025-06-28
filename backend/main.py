from fastapi import FastAPI,Request,Response,status
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from dotenv import load_dotenv
import numpy as np
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import bcrypt
import datetime
import random
import uuid
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

database = os.getenv("DATABASE")
app_password=os.getenv("APPPASSWORD")
my_email=os.getenv("MYEMAIL")
geca_mail=os.getenv("GECAEMAIL")


limiter = Limiter(key_func=get_remote_address)


app=FastAPI()

app.state.limiter = limiter

async def custom_rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    
    retry_after_seconds=60
   
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "detail": "Too many requests.",
            "message": f"You have exceeded the rate limit of {exc.detail}. Please try again in {retry_after_seconds} seconds.",
            "retry_after_seconds": retry_after_seconds
        },
        headers={
            "Retry-After": str(retry_after_seconds)
        }
    )





app.add_exception_handler(RateLimitExceeded, custom_rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://student-dash-9ff0.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


uri = f"mongodb+srv://rajveer:{database}@college.wag2u.mongodb.net/?retryWrites=true&w=majority&appName=College"


client = MongoClient(uri, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)


db = client["GECA"]
sessions_collection = db["sessions"]




def sanitize_input(data):
    if not isinstance(data,str):
        raise ValueError("Invalid input type")
    if data.startswith('$'):
        raise ValueError("Illegal query operator detected")
    return data



def get_selected_collection(request):
    collection_name = request.cookies.get("collection_name")
  
    if not collection_name or collection_name=="user":
        raise ValueError("No collection selected")
    
    collection_name=sanitize_input(collection_name)
    
    collection = db["ME"]
    data = list(collection.find())
    df = pd.DataFrame(data)[["name", "rollno","semester","subject_grade_list","visibility","avatar"]]
   
    df.rename(columns={"rollno":"University Roll Number"},inplace=True)
   
    
    false_visibility_idx = df[df["visibility"] == False].index
 
    for i, idx in enumerate(false_visibility_idx):
        if (i+1)%2==0:
            df.loc[idx, "name"] = f"STU{i+1}{random.randint(1,10)}"
        else:
            df.loc[idx, "name"] = f"STU{random.randint(1,10)}{i+1}"

    return df



def name_list(req):

    df=get_selected_collection(req)
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




def classwiseplot(student_type,req):

    df=get_selected_collection(req)

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


    cgpa = df.dropna(axis=1, how='all')
    sem_cols = [col for col in cgpa.columns if col.startswith("Semester ")]
    cgpa.dropna(axis=0,inplace=True)
    cgpa["cgpa"] = cgpa[sem_cols].mean(axis=1) + 0.005

    def truncate(x, decimals=2):
        factor = 10 ** decimals
        return np.floor(x * factor) / factor

    cgpa["cgpa"] = cgpa["cgpa"].apply(truncate)
    cgpa_df = cgpa[["name", "cgpa"]]
    cgpa_df.dropna(axis=0,inplace=True)
    if not cgpa_df.empty:
        cgpa_df = cgpa_df.sort_values("cgpa", ascending=False)

        semester_info["CGPA"] = [
            cgpa_df["cgpa"].max(),
            cgpa_df["cgpa"].min(),
            cgpa_df["cgpa"].mean().round(2),
            cgpa_df.shape[0],
            len(df)
        ]


        semester_figures["CGPA"]=cgpa_df.to_json(orient="records")

    return semester_figures,semester_info,visible_counts,total_counts

def fetch_subject_name(idx,req):

    df=get_selected_collection(req)
    subject_grade_list = df["subject_grade_list"][idx]

    subject_df = pd.DataFrame()

    for key, grade_list in subject_grade_list.items():
        temp_df = pd.DataFrame(grade_list)
        temp_df["semester"] = key  
        subject_df = pd.concat([subject_df, temp_df], ignore_index=True)
    
    return subject_df[0].to_list(),subject_df[1].to_list()


def student_data(std_name,df,req):
    name = name_list(req)
    if std_name in name:
        idx=name.index(std_name)

        subject_df,grade_df = fetch_subject_name(idx,req)
       
        
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



def verify_password(password, stored_hash):
    return bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8"))


def create_sessions(username):
    session_id=str(uuid.uuid4())
    session_start=datetime.datetime.now()
    expiry_time=datetime.datetime.now()+datetime.timedelta(minutes=30)
    session_doc={
        "_id":session_id,
        "username":username,
        "session_start":session_start,
        "expires_at":expiry_time
    }
    sessions_collection.insert_one(session_doc)
    return session_id

def get_session(session_id):
    session=sessions_collection.find_one({"_id":session_id})
    if session and session["expires_at"]>datetime.datetime.now():
        return session["username"]
    else:
        sessions_collection.delete_one({"_id":session_id})
        return None

def delete_session(session_id):
    sessions_collection.delete_one({"_id": session_id})



def user_login(userLogin,res):
    
    user_collection = db["user"]

    username=sanitize_input(userLogin["username"])
    password=sanitize_input(userLogin["password"])
    
    user = user_collection.find_one({'username': username})
    if user:
        if verify_password(password, user["password"]):
         
            session_id=create_sessions(username)

            res.set_cookie("session_id",session_id,httponly=True,samesite="Strict",secure=False)
            
            return "✅ Login successful"
        else:
            return "⚠️ Invalid username or password"
    else:
        return "⚠️ Invalid username or password"



@app.post("/api/login")
@limiter.limit("3/minute") 
async def login(request: Request, response: Response):
    data = await request.json()
    user = {
        "username": data["username"],
        "password": data["password"]
    }

    return user_login(user, response)

@app.get("/api/home")
def home(request:Request):
    name=name_list(request)
    subject_df,grade_df = fetch_subject_name(0,request)
    return {"name":name,"subject":subject_df}



@app.get("/api/plots")
def get_plots(req:Request):
    semester_figures,semester_info,visible_counts,total_counts = classwiseplot("REAP",req)
    return JSONResponse(content={
        "graphs": semester_figures,
        "semester_info": semester_info,
        "visible_counts": visible_counts,
        "total_counts": total_counts
    })

@app.post("/api/grade")
@limiter.limit("5/minute")
async def grade(request:Request):
    raw_body = await request.body()
    std_name = raw_body.decode('utf-8')
    students_df = get_selected_collection(request)
    students_df=students_df[students_df["name"].str.contains(r"\d")==False]
    subject_df,grade_df,cgpa,avatar = student_data(std_name,students_df,request)
    return [subject_df,grade_df,cgpa,avatar]

@app.post("/api/subject_wise_performance")
async def subject_wise_performance(request:Request):

    data =await request.json()
    subjects = data["subjects"]
    grades = data["grades"]

    all_students_df = get_selected_collection(request)
    all_students_df=all_students_df[all_students_df["visibility"] == True]
    filtered_results = all_students_df.apply(
        lambda row: filter_student_with_subject_grades(row, subjects, grades), axis=1
    )
    
    final_filtered_students = filtered_results.dropna().tolist()
    
    if final_filtered_students:
        return final_filtered_students
    

@app.get("/api/profile")
def user_profile(request:Request,respose:Response):
    session_id=request.cookies.get("session_id")
    session=sessions_collection.find_one({"_id":session_id})
    branch=session['username'][-5:-3]
    collection = db[branch]
    student=collection.find_one({"rollno":session['username']},{"_id":0,"name":1,"avatar":1,"visibility":1})
  
    return student


@app.post("/api/data_visibility")
async def data_visibility(request:Request,respose:Response):

    req =await request.json()
    session_id=request.cookies.get("session_id")
    session=sessions_collection.find_one({"_id":session_id})
    branch=session['username'][-5:-3]

    db[branch].update_one(
            {"rollno": session['username']},
            {"$set": {"visibility": req["identity"]}}
            )
    
    return req["identity"]


@app.post("/api/data_updation")
@limiter.limit("2/day")
async def update_user_data(request: Request, response: Response):
    data=await request.json()
    session_id = request.cookies.get("session_id")
    user=sessions_collection.find_one({"_id":session_id})

    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(geca_mail, app_password)

    msg = MIMEMultipart()
    msg['From'] = geca_mail
    msg['To'] = my_email
    msg['Subject'] = f"Data Updation Request {(user["username"])}"

    body=f"user :{user['username']}, course:{data['course']}, resultType: {data['resultType']}, semester:{data['semester']}"

    msg.attach(MIMEText(body, 'plain'))
    server.sendmail(geca_mail, my_email, msg.as_string())
    server.quit()

    return "Email send Successfully"




@app.post("/api/logout")
def logout(request: Request, response: Response):
    session_id = request.cookies.get("session_id")
    if session_id:
        delete_session(session_id)
        response.delete_cookie("session_id")
    return "Logged out"