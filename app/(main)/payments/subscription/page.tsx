"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionCard from "@/components/SubscriptionCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import usePayment from "@/hooks/usePayment";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingOverlay from "@/components/LoadingOverlay";
import LoadingState from "@/components/LoadingState";

const SubscriptionFee = () => {
  const {
    getSubscriptionCreator,
    getSubscriptionFan,
    getSubscriptionInvestor,
    paymentLoading, 
    updateSubscription
  } = usePayment();
  const [subData, setSubData] = useState<any>({});
 
  const [newPrice, setNewPrice] = useState<any>(subData.price);
  const [newExpiry, setNewExpiry] = useState<any>('');
  const { subscriptioncreator, subscriptionfan, subscriptioninvestor } =
    useSelector((state: RootState) => state.payment);
  const [isOpen, setisOpen] = useState(false);
  const closeDialog = () => {setisOpen(false)
    setSubData('');
    setNewExpiry('')
  };
  useEffect(() => {
    getSubscriptionCreator();
  }, []);
  useEffect(() => {
    setNewPrice(subData.price)
  }, [isOpen])

  const hasSubscriptions =
    (subscriptioncreator?.length ?? 0) > 0 ||
    (subscriptionfan?.length ?? 0) > 0 ||
    (subscriptioninvestor?.length ?? 0) > 0;

  if (paymentLoading && !hasSubscriptions) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading subscriptions..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-[24px]">
      {paymentLoading && hasSubscriptions && (
        <LoadingOverlay message="Processing..." />
      )}
      <div>
        <h2 className="text-2xl"> Our subscriptions pricing</h2>
        <p className="text-sm text-[#A8A8A8]">
          Lorem ipsum dolor sit amet consectetur.
        </p>
      </div>
      <div>
        <Tabs defaultValue="creator" className="">
          <TabsList className="space-x-7 bg-transparent border-b rounded-none px-0 w-full justify-start pb-0 mb-[40px]">
            <TabsTrigger
              className="rounded-none font-normal my-0 text-[#A4A4A4] px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
              onClick={() => {
                getSubscriptionCreator();
              }}
              value="creator"
            >
              Creator
            </TabsTrigger>
            <TabsTrigger
              className="rounded-none font-normal my-0 text-[#A4A4A4] px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
              onClick={() => {
                getSubscriptionFan();
              }}
              value="fan"
            >
              Fan
            </TabsTrigger>

            <TabsTrigger
              className="rounded-none font-normal my-0 text-[#A4A4A4] px-0 py-2 data-[state=active]:border-b-[#F75803] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:font-medium data-[state=active]:bg-transparent"
              onClick={() => {
                getSubscriptionInvestor();
              }}
              value="investor"
            >
              Investor
            </TabsTrigger>
          </TabsList>

          <TabsContent
            className="grid grid-cols-3 gap-4 w-[70%]"
            value="creator"
          >
            {subscriptioncreator?.map((creator) => (
              <div
                key={creator?.id}
                className="border border-[#C8C8C8] p-4 rounded-lg flex flex-col space-y-2 items-center"
              >
                <div className="bg-orange-100 flex items-center space-x-1 rounded-[32px] py-[4px] px-[8px]">
                  <div className="h-1 w-1 rounded-full bg-[#7E2D02]"></div>
                  <p className="text-[#7E2D02]  text-[12px]">{creator.name}</p>
                </div>
                <div className="flex flex-col space-y-0 items-center">
                  <span className=" text-[64px] font-Recoleta ">
                    ${creator?.price}
                  </span>
                  <p className="text-[14px] text-[#808080]">{creator?.type}</p>
                </div>
                <div>
                  <button
                    onClick={() => {
                      setSubData(creator);
                      setisOpen(true);

                    }}
                    className="bg-[#F75803] mt-4 w-[209px] rounded-md py-2 text-sm text-white  active:scale-95 transition-all"
                  >
                    Change Price
                  </button>
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent className="grid grid-cols-3 gap-4 w-[70%]" value="fan">
            {subscriptionfan?.map((creator) => (
              <div
                key={creator?.id}
                className="border border-[#C8C8C8] p-4 rounded-lg flex flex-col space-y-2 items-center"
              >
                <div className="bg-orange-100 flex items-center space-x-1 rounded-[32px] py-[4px] px-[8px]">
                  <div className="h-1 w-1 rounded-full bg-[#7E2D02]"></div>
                  <p className="text-[#7E2D02]  text-[12px]">{creator.name}</p>
                </div>
                <div className="flex flex-col space-y-0 items-center">
                  <span className=" text-[64px] font-Recoleta ">
                    ${creator?.price}
                  </span>
                  <p className="text-[14px] text-[#808080]">{creator?.type}</p>
                </div>
                <div>
                  <button
                    onClick={() => {
                      setSubData(creator);
                      setisOpen(true);

                    }}
                    className="bg-[#F75803] mt-4 w-[209px] rounded-md py-2 text-sm text-white  active:scale-95 transition-all"
                  >
                    Change Price
                  </button>
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent
            className="grid grid-cols-3 gap-4 w-[70%]"
            value="investor"
          >
            {subscriptioninvestor?.map((creator) => (
              <div
                key={creator?.id}
                className="border border-[#C8C8C8] p-4 rounded-lg flex flex-col space-y-2 items-center"
              >
                <div className="bg-orange-100 flex items-center space-x-1 rounded-[32px] py-[4px] px-[8px]">
                  <div className="h-1 w-1 rounded-full bg-[#7E2D02]"></div>
                  <p className="text-[#7E2D02]  text-[12px]">{creator.name}</p>
                </div>
                <div className="flex flex-col space-y-0 items-center">
                  <span className=" text-[64px] font-Recoleta ">
                    ${creator?.price}
                  </span>
                  <p className="text-[14px] text-[#808080]">{creator?.type}</p>
                </div>
                <div>
                  <button
                    onClick={() => {
                      setSubData(creator);
                      setisOpen(true);
                    }}
                    className="bg-[#F75803] mt-4 w-[209px] rounded-md py-2 text-sm text-white  active:scale-95 transition-all"
                  >
                    Change Price
                  </button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="hidden"></DialogTitle>
            <DialogDescription className="hidden"></DialogDescription>
            <div className="flex space-x-2 items-center">
              <div className="bg-orange-100 py-2 px-2 rounded-full">
                <Image
                  src={"/icons/editicon.svg"}
                  height={16}
                  width={16}
                  alt="editicon"
                />
              </div>
              <p className="text-md font-semibold">Edit pricing plans</p>
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">New Price</Label>
              <Input
              type="string"
              value={newPrice}
              onChange={(e) => {
                setNewPrice(e.target.value);
              }}
                className="focus-visible:ring-0 focus-visible:ring-offset-0 border-[#C8C8C8]"
                id="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Select 
              onValueChange={(value) => {
                setNewExpiry(value); 
              }}
              >
                <SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0 focus:ring-transparent border-[#C8C8C8]">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            {newPrice && newExpiry ? <Button
              className="w-full bg-[#F75803] hover:bg-[#F75803] text-white active:scale-95 transition-all"
              onClick={async() => {
                setisOpen(false);
                await updateSubscription(subData.user_type, newPrice, subData.name, newExpiry, subData.type);
                setNewExpiry('');
                if(subData.user_type === 'creator'){
                  await getSubscriptionCreator();
                }else if (subData.user_type === 'fan'){
                  await getSubscriptionFan()
                }else{
                  await getSubscriptionInvestor();
                }
              }}
              type="button"
            >
              Update Price
            </Button> : 
            <Button
            className="btnColoredInactive w-full"
            type="button"
          >
            Update Price
          </Button>
            }
            
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionFee;
