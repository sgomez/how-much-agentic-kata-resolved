/** A non-numeric round never exists: 0 is answered as an unknown round. */
export const roundOf = (n: string): number =>
  /^\d+$/u.test(n) ? Number(n) : 0;
