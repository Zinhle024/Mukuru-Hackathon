import sqlite3
from typing import Optional, List, Dict
from datetime import datetime
from decimal import Decimal

class TransactionService:
    def __init__(self, db_path: str = "user.db"):
        self.db_path = db_path

    def _get_connection(self):
        return sqlite3.connect(self.db_path)

    def get_transaction_by_id(self, transaction_id: int) -> Optional[Dict]:
        """
        Get a specific transaction by id
        """
        conn = self._get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT id, customer_id, amount, recipient_name, recipient_country, 
                       points_earned, status, created_at
                FROM remittance_transactions 
                WHERE id = ?
            """, (transaction_id,))
            
            row = cursor.fetchone()
            if not row:
                return None
            
            return {
                "id": row[0],
                "customer_id": row[1],
                "amount": row[2],
                "currency": "ZAR",
                "recipient": row[3],
                "country": row[4],
                "points_earned": row[5],
                "status": row[6],
                "created_at": row[7]
            }
            
        finally:
            conn.close()

    def get_transaction_history(self, customer_id: int) -> List[Dict]:
        """
        Get all customer transcations from the most recent
        """
        with self._get_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT id, amount_cents, recipient_name, created_at
                FROM transactions
                WHERE customer_id = ?
                ORDER BY created_at DESC
            """, (customer_id,))
            rows = cur.fetchall()

        return [
            {
                "id": row[0],
                "amount_cents": row[1],
                "amount_rands": self._format_rands(row[1]),
                "recipient_name": row[2],
                "created_at": row[3],
            }
            for row in rows
        ]

    @staticmethod
    def _format_rands(amount_cents: int) -> str:
        """Convert cents to formatted Rand string."""
        return f"R{amount_cents / 100:.2f}"

    def update_transaction_status(self, transaction_id: int, new_status: str) -> bool:
        """Update the status of a transaction"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                UPDATE remittance_transactions 
                SET status = ? 
                WHERE id = ?
            """, (new_status, transaction_id))
            
            conn.commit()
            return cursor.rowcount > 0
            
        finally:
            conn.close()

    def get_recent_transactions(self, customer_id: int, limit: int = 5) -> List[Dict]:
        """
        Get customer's most recent transaction
        """
        conn = self._get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT id, amount, recipient_name, recipient_country, points_earned, status, created_at
                FROM remittance_transactions 
                WHERE customer_id = ?
                ORDER BY created_at DESC
                LIMIT ?
            """, (customer_id, limit))
            
            transactions = []
            for row in cursor.fetchall():
                transactions.append({
                    "id": row[0],
                    "amount": row[1],
                    "currency": "ZAR",
                    "recipient": row[2],
                    "country": row[3],
                    "points_earned": row[4],
                    "status": row[5],
                    "created_at": row[6]
                })
            
            return transactions
            
        finally:
            conn.close()
