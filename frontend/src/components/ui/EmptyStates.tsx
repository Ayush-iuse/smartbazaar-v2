import React from 'react';
import { ShoppingBag, MessageSquare, Tag, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = <AlertCircle className="w-10 h-10 text-muted-foreground" />,
  title, 
  description, 
  actionText, 
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-card border border-border/80 rounded-2xl shadow-sm space-y-4 max-w-md mx-auto">
      <div className="p-4 bg-muted/60 dark:bg-slate-800 rounded-full text-muted-foreground">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-sm font-bold tracking-tight text-foreground">{title}</h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      {actionText && onAction && (
        <Button size="sm" onClick={onAction} className="mt-2">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const NoListingsState: React.FC<{ onAction?: () => void }> = ({ onAction }) => (
  <EmptyState
    icon={<ShoppingBag className="w-8 h-8 text-primary" />}
    title="No Listings Found"
    description="We couldn't find any listings matching your search constraints or categories. Try clearing filters."
    actionText="Browse All Listings"
    onAction={onAction}
  />
);

export const NoMessagesState: React.FC = () => (
  <EmptyState
    icon={<MessageSquare className="w-8 h-8 text-brand-500" />}
    title="Inbox is Empty"
    description="No conversations found. Chat threads with listings sellers and buyers will appear here."
  />
);

export const NoLeadsState: React.FC = () => (
  <EmptyState
    icon={<Tag className="w-8 h-8 text-amber-500" />}
    title="No CRM Leads Active"
    description="You have no active buyer negotiations or lead statuses logged. Leads will update automatically when buyers message you."
  />
);

export const NoRecommendationsState: React.FC = () => (
  <EmptyState
    icon={<ShoppingBag className="w-8 h-8 text-indigo-500" />}
    title="No Recommendations Available"
    description="Browse some product items or search terms so the AI Recommendation engine can analyze and discover deals for you!"
  />
);
