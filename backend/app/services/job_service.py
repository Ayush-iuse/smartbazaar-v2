import asyncio
import json
import logging
import traceback
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal
from backend.app.models.enterprise import BackgroundJob
from backend.app.services.trust_service import TrustService
from backend.app.services.trust_score_service import TrustScoreService
from backend.app.models.user import User

logger = logging.getLogger("smartbazaar.jobs")

class JobService:
    @staticmethod
    def queue_job(db: Session, job_type: str, payload: dict, scheduled_at: datetime | None = None) -> BackgroundJob:
        db_job = BackgroundJob(
            job_type=job_type,
            payload=json.dumps(payload),
            scheduled_at=scheduled_at or datetime.utcnow(),
            status="pending"
        )
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        return db_job

    @staticmethod
    async def run_worker():
        logger.info("Background job worker started.")
        print("Background job worker started.")
        while True:
            try:
                await asyncio.sleep(5)  # Poll database every 5 seconds
                db = SessionLocal()
                try:
                    # Fetch pending jobs whose scheduled time has passed
                    now = datetime.utcnow()
                    jobs = db.query(BackgroundJob).filter(
                        BackgroundJob.status == "pending",
                        BackgroundJob.scheduled_at <= now
                    ).all()

                    for job in jobs:
                        job.status = "running"
                        db.commit()
                        logger.info(f"Running background job {job.id} of type {job.job_type}")
                        print(f"Running background job {job.id} of type {job.job_type}")

                        try:
                            payload = json.loads(job.payload) if job.payload else {}
                            
                            # Execute job logic
                            if job.job_type == "trust_recalculation":
                                # Recalculate trust score for all users or a specific user
                                user_id = payload.get("user_id")
                                if user_id:
                                    TrustService.calculate_trust_score(db, user_id)
                                    try:
                                        TrustScoreService.calculate_trust_score(db, user_id)
                                    except Exception as ex:
                                        logger.error(f"Error recalculating buyer score for {user_id}: {ex}")
                                else:
                                    # Recalculate for all users
                                    users = db.query(User).all()
                                    for u in users:
                                        TrustService.calculate_trust_score(db, u.id)
                                        try:
                                            TrustScoreService.calculate_trust_score(db, u.id)
                                        except Exception as ex:
                                            logger.error(f"Error recalculating buyer score for {u.id}: {ex}")
                            
                            elif job.job_type == "recommendation_rebuild":
                                # Placeholder/Mock recommendations refresh logic
                                logger.info("Recommendations rebuilt successfully.")
                                print("Recommendations rebuilt successfully.")
                                
                            elif job.job_type == "analytics_refresh":
                                # Mock analytics refresh logic
                                logger.info("Analytics cache refreshed.")
                                print("Analytics cache refreshed.")
                                
                            elif job.job_type == "email_send":
                                # Mock email dispatch
                                to_email = payload.get("to")
                                subject = payload.get("subject")
                                body = payload.get("body")
                                logger.info(f"Email sent to {to_email}: {subject}")
                                print(f"Email sent to {to_email}: {subject}")
                                
                            elif job.job_type == "cleanup_jobs":
                                # Delete completed or failed jobs older than 1 day
                                threshold = datetime.utcnow()
                                db.query(BackgroundJob).filter(
                                    BackgroundJob.status.in_(["completed", "failed"]),
                                    BackgroundJob.completed_at <= threshold
                                ).delete()
                                db.commit()
                                
                            else:
                                logger.warning(f"Unknown job type: {job.job_type}")

                            # Update status to completed
                            job.status = "completed"
                            job.completed_at = datetime.utcnow()
                            db.commit()
                        except Exception as e:
                            logger.error(f"Error running job {job.id}: {str(e)}")
                            traceback.print_exc()
                            job.status = "failed"
                            job.error = str(e)
                            job.completed_at = datetime.utcnow()
                            db.commit()

                finally:
                    db.close()

            except Exception as outer_e:
                logger.error(f"Background worker iteration error: {str(outer_e)}")
                await asyncio.sleep(5)
