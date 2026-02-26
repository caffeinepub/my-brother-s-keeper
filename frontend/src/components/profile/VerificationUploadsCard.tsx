import { useState } from 'react';
import { useGetCallerUserProfile, useUploadVerification } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { validateFile } from '../../lib/fileValidation';
import { ExternalBlob } from '../../backend';
import { toast } from 'sonner';
import { Upload, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function VerificationUploadsCard() {
    const { data: profile } = useGetCallerUserProfile();
    const uploadVerification = useUploadVerification();
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [idFile, setIdFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<{ license: number; id: number }>({ license: 0, id: 0 });

    const handleFileChange = (type: 'license' | 'id', file: File | null) => {
        if (!file) return;

        const validation = validateFile(file);
        if (!validation.valid) {
            toast.error(validation.error);
            return;
        }

        if (type === 'license') {
            setLicenseFile(file);
        } else {
            setIdFile(file);
        }
    };

    const handleUpload = async () => {
        if (!licenseFile && !idFile) {
            toast.error('Please select at least one file to upload');
            return;
        }

        try {
            let licenseBlob: ExternalBlob | null = null;
            let idBlob: ExternalBlob | null = null;

            if (licenseFile) {
                const licenseBytes = new Uint8Array(await licenseFile.arrayBuffer());
                licenseBlob = ExternalBlob.fromBytes(licenseBytes).withUploadProgress((percentage) => {
                    setUploadProgress((prev) => ({ ...prev, license: percentage }));
                });
            }

            if (idFile) {
                const idBytes = new Uint8Array(await idFile.arrayBuffer());
                idBlob = ExternalBlob.fromBytes(idBytes).withUploadProgress((percentage) => {
                    setUploadProgress((prev) => ({ ...prev, id: percentage }));
                });
            }

            await uploadVerification.mutateAsync({ licenseProof: licenseBlob, idProof: idBlob });
            toast.success('Documents uploaded successfully');
            setLicenseFile(null);
            setIdFile(null);
            setUploadProgress({ license: 0, id: 0 });
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload documents');
        }
    };

    const getVerificationStatus = () => {
        if (!profile?.licenseProof && !profile?.idProof) {
            return { label: 'Not Submitted', icon: XCircle, variant: 'secondary' as const };
        }
        if (profile?.isVerified) {
            return { label: 'Approved', icon: CheckCircle, variant: 'default' as const };
        }
        return { label: 'Pending Review', icon: Clock, variant: 'outline' as const };
    };

    const status = getVerificationStatus();
    const StatusIcon = status.icon;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Verification Documents</CardTitle>
                        <CardDescription>
                            Upload your trucking license and ID proof for verification
                        </CardDescription>
                    </div>
                    <Badge variant={status.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <AlertDescription>
                        Documents must be images (JPEG, PNG, WebP) or PDF files, maximum 10MB each.
                    </AlertDescription>
                </Alert>

                <div className="space-y-2">
                    <Label htmlFor="license">Trucking License</Label>
                    <Input
                        id="license"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange('license', e.target.files?.[0] || null)}
                        disabled={uploadVerification.isPending}
                    />
                    {profile?.licenseProof && (
                        <p className="text-sm text-muted-foreground">✓ License document uploaded</p>
                    )}
                    {uploadProgress.license > 0 && uploadProgress.license < 100 && (
                        <Progress value={uploadProgress.license} />
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="id">ID Proof</Label>
                    <Input
                        id="id"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange('id', e.target.files?.[0] || null)}
                        disabled={uploadVerification.isPending}
                    />
                    {profile?.idProof && (
                        <p className="text-sm text-muted-foreground">✓ ID document uploaded</p>
                    )}
                    {uploadProgress.id > 0 && uploadProgress.id < 100 && (
                        <Progress value={uploadProgress.id} />
                    )}
                </div>

                <Button
                    onClick={handleUpload}
                    disabled={uploadVerification.isPending || (!licenseFile && !idFile)}
                    className="w-full gap-2"
                >
                    <Upload className="h-4 w-4" />
                    {uploadVerification.isPending ? 'Uploading...' : 'Upload Documents'}
                </Button>
            </CardContent>
        </Card>
    );
}
