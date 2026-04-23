import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import connectDB from './config/db.js';
import path from 'path';
import {
    getJobs, postJob, cDashboard, Rdashboard, view, apply,
    saveJob, aplyed, savedJobs, updateJob, profile, CandidateUpdate,
    filter, viewPosted, Applicants, deleteApply, deleteSaved,
    deletePostedJob, EditPostedJob, Accept, Reject, viewCandidate
} from './controllers/jobController.js';
import { candidateLogin, c_register, recruiterRegister, recruiterLogin } from './src/auth.js';

const ab = path.resolve('../frontend/public');
app.use(express.static(ab));
app.set('views', path.resolve('../frontend/views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('trust proxy', 1); 
app.use(session({
    secret: process.env.SESSION_SECRET || 'job_portal_secret_fallback_key_2026',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
    }),
    cookie: {
        maxAge: 60 * 60 * 1000, 
        httpOnly: true,
        secure: false 
    }
}));

app.use(helmet({
    contentSecurityPolicy: false,
}));

connectDB();

app.get('/', (req, resp) => {
    resp.render('index');
});

app.get('/candidate/register', (req, resp) => resp.render('candidate_register'));
app.post('/candidate/register', c_register);
app.get('/candidate/login', (req, resp) => resp.render('candidateLogin'));
app.post('/12', candidateLogin);
app.get('/dashboard', cDashboard);
app.get('/candidate/profile', profile);
app.post('/candidate/update', CandidateUpdate);
app.get('/3', aplyed);
app.get('/savedJobs', savedJobs);
app.get('/deleteAppled/:id', deleteApply);
app.get('/deleteSaved/:id', deleteSaved);
app.get('/applyforjob/:id', apply);
app.get('/saveJob/:id', saveJob);         // capital J — correct route
app.post('/filter', filter);
app.get('/candidate/view-jobs', getJobs);

app.get('/recruiter/register', (req, resp) => resp.render('recuiter_register'));
app.post('/recruiter/register1', recruiterRegister);
app.get('/recruiter/login', (req, resp) => resp.render('recuiter_login'));
app.post('/recruiter/login1', recruiterLogin);
app.get('/Rdashboard', Rdashboard);
app.get('/recruiter/post-job', (req, resp) => resp.render('recuiter_postJob'));
app.post('/recruiter/post-job', postJob);
app.get('/recruiter/view-posted-jobs', viewPosted);
app.get('/recruiter/view-applicants', Applicants);
app.get('/viewpostedJob/:id', view);
app.get('/EditPostedJob/:id', EditPostedJob);
app.post('/recruiter/updateJob', updateJob);
app.get('/deletePosted/:id', deletePostedJob);
app.get('/Accept/:id', Accept);
app.get('/Reject/:id', Reject);
app.post('/viewCandidate', viewCandidate);

// Logout (clears session)
app.get('/logout', (req, resp) => {
    req.session.destroy();
    resp.redirect('/');
});

app.use((req, resp) => {
    resp.status(404).send(`
        <!DOCTYPE html><html><head><title>404 - Not Found</title>
        <link rel="stylesheet" href="/css/style.css"></head>
        <body style="display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:16px;">
        <div style="font-size:72px;">🔍</div>
        <h1 style="color:#7c2d12;font-size:32px;font-weight:800;">Page Not Found</h1>
        <p style="color:#92400e;">The page you're looking for doesn't exist.</p>
        <a href="/" style="padding:12px 28px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;">Go Home</a>
        </body></html>
    `);
});

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
