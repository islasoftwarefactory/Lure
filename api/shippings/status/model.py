from api.utils.db.connection import db
from datetime import datetime
import pytz
from typing import Dict, Optional
from flask import current_app

class ShippingStatus(db.Model):
    __tablename__ = "shipping_status"

    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(256), nullable=True)
    conclusion_id = db.Column(db.Integer, db.ForeignKey('shipping_conclusion.id'), nullable=True)
    tracking_number = db.Column(db.String(100), nullable=True)
    estimated_delivery_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')), onupdate=lambda: datetime.now(pytz.timezone('America/Sao_Paulo')))

    conclusion = db.relationship('ShippingConclusion', backref='shipping_statuses', lazy='dynamic')

    def __repr__(self):
        return f"<ShippingStatus id={self.id}>"

    def serialize(self):
        return {
            "id": self.id,
            "description": self.description,
            "conclusion_id": self.conclusion_id,
            "tracking_number": self.tracking_number,
            "estimated_delivery_date": self.estimated_delivery_date.isoformat() if self.estimated_delivery_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

def find_shipping_status_by_id(status_id: int) -> Optional[ShippingStatus]:
    """Busca um status de envio pelo ID."""
    return ShippingStatus.query.get(status_id)

def create_shipping_status(status_data: Dict) -> ShippingStatus:
    """Cria um novo status de envio."""
    current_app.logger.info(f"Iniciando criação de status de envio.")

    required_fields = []
    if not all(field in status_data for field in required_fields):
        raise ValueError(f"Dados incompletos para criar status de envio. Campos necessários: {required_fields}")

    try:
        shipping_status = ShippingStatus(
            description=status_data.get("description"),
            conclusion_id=status_data.get("conclusion_id")
        )
        db.session.add(shipping_status)
        db.session.commit()
        current_app.logger.info(f"Status de envio criado com sucesso.")
        return shipping_status
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erro ao criar status de envio: {str(e)}")
        raise

def update_shipping_status(status_id: int, status_data: Dict) -> Optional[ShippingStatus]:
    """Atualiza um status de envio existente."""
    shipping_status = find_shipping_status_by_id(status_id)
    if not shipping_status:
        current_app.logger.warning(f"Tentativa de atualizar status de envio inexistente: ID {status_id}")
        return None

    current_app.logger.info(f"Atualizando status de envio ID {status_id}")
    try:
        allowed_updates = ['description', 'conclusion_id', 'tracking_number', 'estimated_delivery_date']
        updated = False
        for key, value in status_data.items():
            if key in allowed_updates:
                setattr(shipping_status, key, value)
                updated = True

        if updated:
            db.session.commit()
            current_app.logger.info(f"Status de envio ID {status_id} atualizado com sucesso.")
        else:
            current_app.logger.info(f"Nenhuma alteração detectada para status de envio ID {status_id}.")

        return shipping_status
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erro ao atualizar status de envio ID {status_id}: {str(e)}")
        raise

def delete_shipping_status(status_id: int) -> bool:
    """Deleta um status de envio pelo ID."""
    shipping_status = find_shipping_status_by_id(status_id)
    if shipping_status:
        try:
            db.session.delete(shipping_status)
            db.session.commit()
            current_app.logger.info(f"Status de envio ID {status_id} deletado.")
            return True
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Erro ao deletar status de envio ID {status_id}: {str(e)}")
            raise
    current_app.logger.warning(f"Tentativa de deletar status de envio inexistente: ID {status_id}")
    return False