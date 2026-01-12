"use client";

import { useState } from "react";
import { CryptoAsset, Network } from "@prisma/client";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Plus, Pencil, Trash2, Globe, Coins, Loader2 } from "lucide-react";
import { createAsset, updateAsset, deleteAsset, createNetwork, updateNetwork, deleteNetwork, getAssets } from "@/app/actions/admin";
import { Modal } from "@/app/components/ui/Modal";
import toast from "react-hot-toast";
import { UploadButton } from "@/app/utils/uploadthing";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

type AssetWithNetworks = CryptoAsset & { networks: Network[] };

interface AssetsManagerProps {
  initialAssets: AssetWithNetworks[];
}

export function AssetsManager({ initialAssets }: AssetsManagerProps) {
  const { data: assets, refetch } = useQuery({
      queryKey: ['assets'],
      queryFn: () => getAssets(),
      initialData: initialAssets,
      staleTime: 1000 * 60,
      refetchInterval: 1000 * 60,
  });

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [editingAsset, setEditingAsset] = useState<CryptoAsset | null>(null);
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ type: 'ASSET' | 'NETWORK', id: string } | null>(null);

  const [assetForm, setAssetForm] = useState({ symbol: "", name: "", icon: "" });
  const [networkForm, setNetworkForm] = useState({ name: "", depositAddress: "", icon: "" });
  
  // Loading states
  const [isUploadingAssetIcon, setIsUploadingAssetIcon] = useState(false);
  const [isUploadingNetworkIcon, setIsUploadingNetworkIcon] = useState(false);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [isSavingNetwork, setIsSavingNetwork] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetForms = () => {
    setAssetForm({ symbol: "", name: "", icon: "" });
    setNetworkForm({ name: "", depositAddress: "", icon: "" });
    setEditingAsset(null);
    setEditingNetwork(null);
    setSelectedAssetId(null);
    setPendingDelete(null);
  };

  const handleOpenAddAsset = () => {
    resetForms();
    setIsAssetModalOpen(true);
  };

  const handleEditAsset = (asset: CryptoAsset) => {
    setEditingAsset(asset);
    setAssetForm({ 
        symbol: asset.symbol, 
        name: asset.name, 
        icon: asset.icon || ""
    });
    setIsAssetModalOpen(true);
  };

  const handleOpenAddNetwork = (assetId: string) => {
    resetForms();
    setSelectedAssetId(assetId);
    setIsNetworkModalOpen(true);
  };

  const handleEditNetwork = (network: Network, assetId: string) => {
    setEditingNetwork(network);
    setSelectedAssetId(assetId);
    setNetworkForm({ 
        name: network.name, 
        depositAddress: network.depositAddress || "",
        icon: network.icon || ""
    });
    setIsNetworkModalOpen(true);
  };

  const handleDeleteRequest = (type: 'ASSET' | 'NETWORK', id: string) => {
    setPendingDelete({ type, id });
    setIsConfirmOpen(true);
  };

  const handleSaveAsset = async () => {
    setIsSavingAsset(true);
    try {
      if (editingAsset) {
        const res = await updateAsset(editingAsset.id, assetForm);
        if (!res.success) throw new Error(res.error);
        toast.success("Asset updated successfully");
      } else {
        const res = await createAsset(assetForm);
        if (!res.success) throw new Error(res.error);
        toast.success("Asset created successfully");
      }
      setIsAssetModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create asset");
    } finally {
      setIsSavingAsset(false);
    }
  };

  const handleSaveNetwork = async () => {
    setIsSavingNetwork(true);
    try {
      if (!editingNetwork && !selectedAssetId) return;

      const data = {
          name: networkForm.name || "Default Network", 
          depositAddress: networkForm.depositAddress || undefined,
          icon: networkForm.icon || undefined,
          assetId: selectedAssetId!
      };

      if (editingNetwork) {
        const res = await updateNetwork(editingNetwork.id, data);
        if (!res.success) throw new Error(res.error);
        toast.success("Network updated successfully");
      } else {
        const res = await createNetwork(data);
        if (!res.success) throw new Error(res.error);
        toast.success("Network added successfully");
      }
      setIsNetworkModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register network");
    } finally {
      setIsSavingNetwork(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      if (pendingDelete.type === 'ASSET') {
        const res = await deleteAsset(pendingDelete.id);
        if (!res.success) throw new Error(res.error);
        toast.success("Asset deleted");
      } else {
        const res = await deleteNetwork(pendingDelete.id);
        if (!res.success) throw new Error(res.error);
        toast.success("Network deleted");
      }
      setIsConfirmOpen(false);
      setPendingDelete(null);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium text-slate-900">Crypto Assets</h2>
          <p className="text-slate-500">Manage supported coins, logos, and networks.</p>
        </div>
        <Button onClick={handleOpenAddAsset} className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
          <Plus className="h-4 w-4 mr-2" /> Add New Asset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assets?.map((asset) => (
          <Card key={asset.id} className="p-6 border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Asset Icon */}
                <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-slate-100 bg-white"
                >
                    {asset.icon ? (
                       <Image src={asset.icon} alt={asset.symbol} width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                       <span className="text-slate-400 font-black text-xl">{asset.symbol[0]}</span>
                    )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900 leading-tight flex items-center gap-2">
                    {asset.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{asset.symbol}</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => handleEditAsset(asset)}>
                    <Pencil className="h-4 w-4 text-slate-500 hover:text-slate-800 transition-colors" />
                 </button>
                 <button onClick={() => handleDeleteRequest('ASSET', asset.id)}>
                    <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600 transition-colors" />
                 </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Supported Networks</span>
                <Button variant="ghost" className="h-6 text-[10px] px-2 font-bold text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => handleOpenAddNetwork(asset.id)}>
                    + Add Network
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {asset.networks.length === 0 ? (
                  <div className="text-center py-4 border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium">No networks configured</p>
                  </div>
                ) : (
                  asset.networks.map((net) => (
                    <div key={net.id} className="bg-slate-50 border border-slate-200/50 p-3 rounded-xl flex items-start justify-between group">
                      <div className="flex items-center gap-3 overflow-hidden min-w-0">
                         {/* Network Icon */}
                         {net.icon ? (
                             <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-white">
                                 <Image src={net.icon} alt={net.name} width={32} height={32} className="object-cover w-full h-full" />
                             </div>
                         ) : (
                             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                 <Globe className="h-4 w-4 text-slate-400" />
                             </div>
                         )}

                         <div className="flex flex-col min-w-0">
                             <div className="flex items-baseline gap-2">
                                <span className="text-xs font-semibold text-slate-700 truncate">{net.name}</span>
                             </div>
                             <span className="text-xs font-medium text-slate-500 break-all font-mono leading-relaxed mt-1.5 block">
                                {net.depositAddress || "No address configured"}
                             </span>
                         </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-4">
                         <button onClick={() => handleEditNetwork(net, asset.id)}>
                             <Pencil className="h-3.5 w-3.5 text-slate-500 hover:text-slate-800 transition-colors" />
                         </button>
                         <button onClick={() => handleDeleteRequest('NETWORK', net.id)}>
                             <Trash2 className="h-3.5 w-3.5 text-red-400 hover:text-red-600 transition-colors" />
                         </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* --- MODALS --- */}

      {/* Asset Modal */}
      <Modal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} title={editingAsset ? "Edit Asset" : "New Asset"}>
        <div className="p-6 space-y-4">
            <div className="flex items-center mb-6">
                <div className="relative w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                    {assetForm.icon ? (
                        <Image src={assetForm.icon} alt="Preview" fill className="object-cover" />
                    ) : (
                        <Coins className="h-8 w-8 text-slate-300" />
                    )}
                </div>
                <div className="ml-4 flex flex-col items-start gap-2">
                    <p className="text-xs text-slate-500 font-medium">Upload Icon (PNG/JPG)</p>
                    <UploadButton
                        endpoint="imageUploader"
                        onBeforeUploadBegin={(files) => {
                           setIsUploadingAssetIcon(true);
                           return files;
                        }}
                        onClientUploadComplete={(res) => {
                           if (res && res[0]) {
                               setAssetForm({...assetForm, icon: res[0].url});
                               toast.success("Icon uploaded");
                           }
                           setIsUploadingAssetIcon(false);
                        }}
                        onUploadError={(error: Error) => {
                           toast.error(`Upload failed: ${error.message}`);
                           setIsUploadingAssetIcon(false);
                        }}
                        appearance={{
                            button: "bg-slate-900 text-white !flex items-center justify-center text-xs px-3 py-1 h-8 shadow-none"
                        }}
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                    <Input value={assetForm.name} onChange={(e) => setAssetForm({...assetForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Symbol</label>
                    <Input value={assetForm.symbol} onChange={(e) => setAssetForm({...assetForm, symbol: e.target.value.toUpperCase()})} />
                </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsAssetModalOpen(false)} disabled={isSavingAsset || isUploadingAssetIcon}>Cancel</Button>
                <Button onClick={handleSaveAsset} className="bg-slate-900 text-white" disabled={isSavingAsset || isUploadingAssetIcon}>
                    {isSavingAsset ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                    ) : (
                        "Save"
                    )}
                </Button>
            </div>
        </div>
      </Modal>

      {/* Network Modal */}
      <Modal isOpen={isNetworkModalOpen} onClose={() => setIsNetworkModalOpen(false)} title={editingNetwork ? "Edit Network" : "Add Network"}>
        <div className="p-6 space-y-4">
             <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-full bg-slate-50 border shrink-0 overflow-hidden relative flex items-center justify-center">
                    {networkForm.icon ? (
                        <Image src={networkForm.icon} alt="Net" fill className="object-cover" />
                    ) : (
                        <Globe className="h-6 w-6 text-slate-300" />
                    )}
                 </div>
                 <UploadButton
                 className="flex"
                        endpoint="imageUploader"
                        onBeforeUploadBegin={(files) => {
                           setIsUploadingNetworkIcon(true);
                           return files;
                        }}
                        onClientUploadComplete={(res) => {
                           if (res && res[0]) {
                               setNetworkForm({...networkForm, icon: res[0].url});
                               toast.success("Network icon uploaded");
                           }
                           setIsUploadingNetworkIcon(false);
                        }}
                        onUploadError={(error: Error) => {
                           toast.error("Upload failed");
                           setIsUploadingNetworkIcon(false);
                        }}
                        appearance={{
                            button: "bg-slate-900 text-white !flex items-center justify-center text-xs px-3 py-1 h-8 shadow-none"
                        }}
                 />
             </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Network Name (Optional)</label>
                <Input value={networkForm.name} onChange={(e) => setNetworkForm({...networkForm, name: e.target.value})} />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Deposit Address (Optional)</label>
                <Input value={networkForm.depositAddress} onChange={(e) => setNetworkForm({...networkForm, depositAddress: e.target.value})} />
            </div>
            <div className="pt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsNetworkModalOpen(false)} disabled={isSavingNetwork || isUploadingNetworkIcon}>Cancel</Button>
                <Button onClick={handleSaveNetwork} className="bg-slate-900 text-white" disabled={isSavingNetwork || isUploadingNetworkIcon}>
                    {isSavingNetwork ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                    ) : (
                        "Save Network"
                    )}
                </Button>
            </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Confirm Delete">
         <div className="p-6">
            <p className="text-slate-600 mb-6">Are you sure? This cannot be undone.</p>
            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsConfirmOpen(false)} disabled={isDeleting}>Cancel</Button>
                <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                    {isDeleting ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting...</>
                    ) : (
                        "Delete"
                    )}
                </Button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
