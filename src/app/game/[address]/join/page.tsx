"use client";
import * as React from "react";
import DeployShips from "../../../../components/DeployShips";
interface IJoinGamePageProps {}

const JoinGamePage = ({ params }: { params: { address: string } }) => {
  return params.address ? (
    <DeployShips gameAddress={params.address as string} />
  ) : (
    <div>loading...</div>
  );
};

export default JoinGamePage;
