'use client';

import React, { useState } from "react";
import { ID, Query } from "appwrite";
import { databases } from "./utils";
import { STAGING_DATABASE_ID, STARTUP_DATABASE, STARTUP_ID } from "@/appwrite/config";
import { REGULATORY_COLLECTION_ID } from "@/components/Collections/view/CompanyInfotabs/RegulatoryInformation";
import { Button } from "@/components/ui/button";
import { CONTACT_ID } from "@/components/Collections/view/CompanyInfotabs/Contact";
import { ABOUT_COLLECTION_ID } from "@/components/Collections/view/CompanyInfotabs/AboutBusiness";
import { CUSTOMER_COLLECTION_ID } from "@/components/Collections/view/CompanyInfotabs/CustomerTestimonials";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FUND_RAISED_ID } from "@/components/Collections/view/FundingMilestonestabs/FundRaised";
import { SHAREHOLDERS_ID } from "@/components/Collections/view/FundingMilestonestabs/Shareholders";
import { DOC_CHECKLIST_ID } from "@/components/Collections/view/Documentstabs/DocumentsChecklist";
import { PATENTS_ID } from "@/components/Collections/view/Documentstabs/Patents";
import { INCUBATION_ID } from "@/components/Collections/view/Documentstabs/Incubation";
import { ROC_ID } from "@/components/Collections/view/Compliancetabs/ROCcompliance";
import { INCOME_TAX_TABLE_ID } from "@/components/Collections/view/Compliancetabs/IncomeTax";
import { GST_ID } from "@/components/Collections/view/Compliancetabs/GSTcompliance";
import { GSTR_ID } from "@/components/Collections/view/Compliancetabs/GSTR1";
import { ESIC_COLLECTION_ID, ESIC_EPF_COLLECTION_ID } from "@/components/Collections/view/Compliancetabs/esic";
import { CAP_TABLE_COUNT_ID, CAP_TABLE_ID } from "@/components/Collections/view/FundingMilestonestabs/CapTable";
import { TRANCHES_MILESTONES_ID, TRANCHES_TABLE_COLLECTION_ID } from "@/components/Collections/view/FundingMilestonestabs/Milestones";
import { PROPOSED_FUND_ASK_ID, VALIDATED_FUND_ASK_ID } from "@/components/Collections/view/FundingMilestonestabs/FundAsk";

interface MigrationButtonProps {
  startupId: string;
}

const sourceDatabaseId = STAGING_DATABASE_ID;
const targetDatabaseId = STARTUP_DATABASE;

const collectionPairs = [
  { source: STARTUP_ID, target: STARTUP_ID },
  { source: REGULATORY_COLLECTION_ID, target: REGULATORY_COLLECTION_ID },
  { source: CONTACT_ID, target: CONTACT_ID },
  { source: ABOUT_COLLECTION_ID, target: ABOUT_COLLECTION_ID },
  { source: CUSTOMER_COLLECTION_ID, target: CUSTOMER_COLLECTION_ID },

  { source: FUND_RAISED_ID, target: FUND_RAISED_ID},
  { source: SHAREHOLDERS_ID, target: SHAREHOLDERS_ID},
  { source: CAP_TABLE_COUNT_ID, target: CAP_TABLE_COUNT_ID},
  { source: CAP_TABLE_ID, target: CAP_TABLE_ID},
  { source: PROPOSED_FUND_ASK_ID, target: PROPOSED_FUND_ASK_ID},
  { source: VALIDATED_FUND_ASK_ID, target: VALIDATED_FUND_ASK_ID},
  { source: TRANCHES_TABLE_COLLECTION_ID, target: TRANCHES_TABLE_COLLECTION_ID},
  { source: TRANCHES_MILESTONES_ID, target: TRANCHES_MILESTONES_ID},

  { source: ROC_ID, target: ROC_ID },
  { source: INCOME_TAX_TABLE_ID, target: INCOME_TAX_TABLE_ID },
  { source: GST_ID, target: GST_ID },
  { source: GSTR_ID, target: GSTR_ID },
  { source: ESIC_COLLECTION_ID, target: ESIC_COLLECTION_ID },
  { source: ESIC_EPF_COLLECTION_ID, target: ESIC_EPF_COLLECTION_ID },

  { source: DOC_CHECKLIST_ID, target: DOC_CHECKLIST_ID},
  { source: PATENTS_ID, target: PATENTS_ID},
  { source: INCUBATION_ID, target: INCUBATION_ID},

  // Add more collections
];

export const MigrationButton: React.FC<MigrationButtonProps> = ({ startupId }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [latestLog, setLatestLog] = useState<string>('No logs yet...');
  const [progress, setProgress] = useState(0);

  const TARGET_STARTUP_ID = startupId;

  const migrateAllCollections = async () => {
    setLoading(true);
    setStatus('');
    setLatestLog('Migration started...');
    setOpen(true);
    setProgress(0);

    for (let i = 0; i < collectionPairs.length; i++) {
      const { source, target } = collectionPairs[i];
      try {
        let documentsToMigrate = [];

        if (source === STARTUP_ID) {
          const doc = await databases.getDocument(sourceDatabaseId, source, TARGET_STARTUP_ID);
          documentsToMigrate.push(doc);
        } else {
          const result = await databases.listDocuments(sourceDatabaseId, source, [
            Query.equal("startupId", [TARGET_STARTUP_ID]),
          ]);
          documentsToMigrate = result.documents;
        }

        for (const doc of documentsToMigrate) {
          const { $id, $collectionId, $databaseId, $createdAt, $updatedAt, ...data } = doc;
          await databases.createDocument(targetDatabaseId, target, $id, data);
          const logMsg = `Migrated document ${doc.$id} from ${source} to ${target}`;
          setLatestLog(logMsg);
        }
        // Update progress after each collection pair
        const newProgress = Math.floor(((i + 1) / collectionPairs.length) * 100);
        setProgress(newProgress);

      } catch (error) {
        const errorMsg = `Error migrating from ${source} to ${target}: ${error instanceof Error ? error.message : String(error)}`;
        setLatestLog(errorMsg);
        setStatus(`❌ Migration failed at ${source} → ${target}`);
        setLoading(false);
        return;
      }
    }
    setLatestLog('✅ Data migration complete.');
    setStatus('✅ Data migration complete.');
    setProgress(100);
    setLoading(false);
  };

  return (
    <div>
      <Button 
        onClick={migrateAllCollections} disabled={loading}>
        {loading ? 'Migrating...' : 'Data Migration'}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Migration Status</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="min-h-[50px] p-2 bg-gray-100 rounded font-mono text-sm whitespace-pre-wrap">
                {progress > 0 && <div className="mb-4">Progress: {progress}%</div>}
                {latestLog}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setOpen(false)} disabled={loading}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
