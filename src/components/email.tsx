import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Archive, ArchiveX, Clock, EllipsisVertical, Forward, Inbox, Reply, ReplyAll, Trash2 } from 'lucide-react';

interface Email {
  id: string;
  from: string;
  subject: string;
  replyTo: string;
  date: string;
  content: string;
}

interface EmailViewProps {
  email: Email;
}

const EmailView: React.FC<EmailViewProps> = ({ email }) => {
  const [replyContent, setReplyContent] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const handleReply = () => {
    // Implement reply logic
    console.log('Replying with:', replyContent);
  };

  const handleArchive = () => {
    // Implement archive logic
    console.log('Archiving email');
  };

  const handleMoveToJunk = () => {
    // Implement move to junk logic
    console.log('Moving to junk');
  };

  const handleDelete = () => {
    // Implement delete logic
    console.log('Deleting email');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Button onClick={handleArchive} variant="ghost" size="icon">
            <Archive className="h-4 w-4" />
            <span className="sr-only">Archive</span>
          </Button>
          <Button onClick={handleMoveToJunk} variant="ghost" size="icon">
            <ArchiveX className="h-4 w-4" />
            <span className="sr-only">Move to junk</span>
          </Button>
          <Button onClick={handleDelete} variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Move to trash</span>
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="ghost" size="icon">
            <Clock className="h-4 w-4" />
            <span className="sr-only">Snooze</span>
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Reply className="h-4 w-4" />
            <span className="sr-only">Reply</span>
          </Button>
          <Button variant="ghost" size="icon">
            <ReplyAll className="h-4 w-4" />
            <span className="sr-only">Reply all</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Forward className="h-4 w-4" />
            <span className="sr-only">Forward</span>
          </Button>
        </div>
        <div className="w-px h-6 bg-border mx-2" />
        <Button variant="ghost" size="icon">
          <EllipsisVertical className="h-4 w-4" />
          <span className="sr-only">More</span>
        </Button>
      </div>
      <div className="h-px w-full bg-border" />
      <div className="flex flex-1 flex-col">
        <div className="flex items-start p-4">
          <div className="flex items-start gap-4 text-sm">
            <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                {email.from.split(' ').map(n => n[0]).join('')}
              </span>
            </span>
            <div className="grid gap-1">
              <div className="font-semibold">{email.from}</div>
              <div className="line-clamp-1 text-xs">{email.subject}</div>
              <div className="line-clamp-1 text-xs">
                <span className="font-medium">Reply-To:</span> {email.replyTo}
              </div>
            </div>
          </div>
          <div className="ml-auto text-xs text-muted-foreground">{email.date}</div>
        </div>
        <div className="h-px w-full bg-border" />
        <div className="flex-1 whitespace-pre-wrap p-4 text-sm">{email.content}</div>
        <div className="h-px w-full bg-border mt-auto" />
        <div className="p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleReply(); }}>
            <div className="grid gap-4">
              <Textarea
                placeholder={`Reply ${email.from}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-xs font-normal">
                  <Switch
                    checked={isMuted}
                    onCheckedChange={setIsMuted}
                    aria-label="Mute thread"
                  />
                  Mute this thread
                </label>
                <Button type="submit" size="sm" className="ml-auto">
                  Send
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailView;
