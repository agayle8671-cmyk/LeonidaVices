"""Resend email notifications for pin upvotes and verification events."""
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

import os
import asyncio
import logging
import resend

from database import db

logger = logging.getLogger(__name__)
resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
APP_URL = os.environ.get("APP_URL", "http://localhost:3000")


# ── HTML builder ─────────────────────────────────────────────────────────────
def _build_upvote_html(username: str, pin_name: str, upvote_count: int, is_verified: bool) -> str:
    verified_block = ""
    if is_verified:
        verified_block = """
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
          <tr><td style="background:rgba(57,255,20,0.1);border:1px solid rgba(57,255,20,0.4);border-radius:10px;padding:16px;text-align:center;">
            <p style="color:#39FF14;font-size:18px;font-weight:bold;margin:0 0 4px;">&#10003; PIN VERIFIED!</p>
            <p style="color:#9ca3af;font-size:13px;margin:0;">Your pin reached 3+ upvotes and is now officially verified on the Leonida Community Atlas.</p>
          </td></tr>
        </table>"""

    return f"""<!DOCTYPE html>
<html><body style="background-color:#050505;margin:0;padding:20px;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0F0C29;border:1px solid rgba(255,0,127,0.4);border-radius:16px;">
    <tr><td style="padding:32px;">
      <p style="margin:0 0 4px;color:#FF007F;font-size:22px;font-weight:bold;">Honest John's Travel Agency&#8482;</p>
      <p style="margin:0 0 24px;color:#FFE600;font-size:12px;font-style:italic;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:16px;">Leonida's Premier Community Intelligence Network</p>

      <p style="color:#e5e7eb;font-size:16px;margin:0 0 12px;">Congratulations, <strong style="color:#00E5FF;">{username}</strong>!</p>
      <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 8px;">Your community pin <strong style="color:#ffffff;">&#34;{pin_name}&#34;</strong> just received an upvote from a fellow Leonida explorer!</p>
      <p style="color:#9ca3af;font-size:14px;margin:0 0 16px;">It now has <strong style="color:#00E5FF;font-size:18px;">{upvote_count}</strong> upvotes{' and is verified! &#127881;' if is_verified else '.'}</p>

      {verified_block}

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        <tr><td style="background:rgba(255,0,127,0.08);border:1px solid rgba(255,0,127,0.2);border-radius:8px;padding:14px;">
          <p style="color:#9ca3af;font-size:12px;font-style:italic;margin:0 0 6px;">"Every upvote represents another adventurous tourist preparing for their Leonida experience. Honest John's takes no responsibility for what they find there."</p>
          <p style="color:#FF007F;font-size:11px;text-align:right;margin:0;">&#8212; Honest John, Proprietor</p>
        </td></tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 24px;">
        <a href="{APP_URL}/map" style="display:inline-block;background:#FF007F;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;letter-spacing:0.08em;">VIEW YOUR PIN ON THE MAP</a>
      </td></tr></table>

      <p style="color:#374151;font-size:11px;text-align:center;margin:0;">&#169; 2026 Honest John Enterprises LLC &#183; Not liable for pin-related incidents &#183; <a href="{APP_URL}" style="color:#6b7280;">Visit Leonida</a></p>
    </td></tr>
  </table></td></tr>
</table>
</body></html>"""


def _build_verified_html(username: str, pin_name: str) -> str:
    return f"""<!DOCTYPE html>
<html><body style="background-color:#050505;margin:0;padding:20px;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0F0C29;border:1px solid rgba(57,255,20,0.5);border-radius:16px;">
    <tr><td style="padding:32px;">
      <p style="margin:0 0 4px;color:#39FF14;font-size:22px;font-weight:bold;">&#127942; Pin Verified!</p>
      <p style="margin:0 0 24px;color:#FFE600;font-size:12px;font-style:italic;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:16px;">Honest John's Community Atlas &#183; Verification Department</p>

      <p style="color:#e5e7eb;font-size:16px;margin:0 0 12px;">Outstanding work, <strong style="color:#39FF14;">{username}</strong>!</p>
      <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px;">Your community pin <strong style="color:#ffffff;">&#34;{pin_name}&#34;</strong> has been <strong style="color:#39FF14;">officially verified</strong> on the Leonida Community Atlas. It received 3 or more upvotes from fellow explorers, confirming its authenticity.</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
        <tr><td align="center" style="background:rgba(57,255,20,0.08);border:1px solid rgba(57,255,20,0.3);border-radius:10px;padding:20px;">
          <p style="color:#39FF14;font-size:28px;margin:0 0 4px;">&#10003;</p>
          <p style="color:#39FF14;font-size:16px;font-weight:bold;margin:0 0 4px;">COMMUNITY VERIFIED</p>
          <p style="color:#6b7280;font-size:12px;margin:0;">Your pin now carries the Verified badge on the interactive map</p>
        </td></tr>
      </table>

      <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:0 0 20px;">This verification also earns you <strong style="color:#FFE600;">5 bonus points</strong> on the Leaderboard. Keep mapping — Leonida's geography isn't going to document itself!</p>

      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 24px;">
        <a href="{APP_URL}/leaderboard" style="display:inline-block;background:#39FF14;color:#000000;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;letter-spacing:0.08em;margin-right:8px;">VIEW LEADERBOARD</a>
      </td></tr></table>

      <p style="color:#374151;font-size:11px;text-align:center;margin:0;">&#169; 2026 Honest John Enterprises LLC &#183; <a href="{APP_URL}" style="color:#6b7280;">Visit Leonida</a></p>
    </td></tr>
  </table></td></tr>
</table>
</body></html>"""


# ── Notification senders ─────────────────────────────────────────────────────
async def notify_upvote(poi: dict, upvote_count: int):
    """Fire-and-forget: email the pin submitter about an upvote."""
    submitter_id = poi.get("submitter_user_id")
    if not submitter_id:
        return
    try:
        user = await db.users.find_one({"id": submitter_id}, {"_id": 0, "email": 1, "display_name": 1, "username": 1, "prefs": 1})
        if not user or not user.get("email"):
            return
        # Respect user preferences (default: enabled)
        if not user.get("prefs", {}).get("email_upvote", True):
            logger.info(f"Upvote email skipped (preference off) for {user['email']}")
            return
        username = user.get("display_name") or user["username"]
        is_verified = upvote_count >= 3
        subject = (
            f"🏆 Your pin '{poi['name']}' is now VERIFIED! — Honest John's"
            if is_verified else
            f"👍 Your Leonida pin got an upvote! ({upvote_count} total)"
        )
        html = _build_upvote_html(username, poi["name"], upvote_count, is_verified)
        params = {"from": SENDER, "to": [user["email"]], "subject": subject, "html": html}
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Upvote email sent → {user['email']} (pin: {poi['name']}, count: {upvote_count})")
    except Exception as e:
        logger.warning(f"Upvote email failed for poi {poi.get('id')}: {e}")


async def notify_verified(poi: dict):
    """Fire-and-forget: email the pin submitter that their pin is officially verified."""
    submitter_id = poi.get("submitter_user_id")
    if not submitter_id:
        return
    try:
        user = await db.users.find_one({"id": submitter_id}, {"_id": 0, "email": 1, "display_name": 1, "username": 1, "prefs": 1})
        if not user or not user.get("email"):
            return
        # Respect user preferences (default: enabled)
        if not user.get("prefs", {}).get("email_verified", True):
            logger.info(f"Verified email skipped (preference off) for {user['email']}")
            return
        username = user.get("display_name") or user["username"]
        html = _build_verified_html(username, poi["name"])
        params = {
            "from": SENDER,
            "to": [user["email"]],
            "subject": f"🏆 Your pin '{poi['name']}' is officially Verified! — Honest John's",
            "html": html,
        }
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Verified email sent → {user['email']} (pin: {poi['name']})")
    except Exception as e:
        logger.warning(f"Verified email failed for poi {poi.get('id')}: {e}")
