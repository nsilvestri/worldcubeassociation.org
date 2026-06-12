import React from "react";
import {
  Box,
  Button,
  Collapsible,
  HStack,
  IconButton,
  Menu,
  Separator,
  Text,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import { auth } from "@/auth";
import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import { ColorModeButton } from "@/components/ui/color-mode";
import { LuChevronDown, LuMenu } from "react-icons/lu";

import LanguageSelector from "@/components/ui/languageSelector";
import IconDisplay from "@/components/IconDisplay";
import type { IconName, Nav, SocialLink } from "@/types/payload";
import AvatarMenu from "@/components/ui/avatarMenu";
import WCALogo from "@/components/WCALogo";
import WcaSearch from "@/components/SearchBar/WcaSearch";

type NavEntry = Nav["entry"][number];
type NavDropdownEntry = Extract<NavEntry, { blockType: "NavDropdown" }>;

type NavDropdownSubEntry = NavDropdownEntry["entries"][number];
type NestedDropdownEntry = Extract<
  NavDropdownSubEntry,
  { blockType: "NestedDropdown" }
>;
type NestedLinkItem = Extract<
  NestedDropdownEntry["entries"][number],
  { blockType: "LinkItem" | "ExternalLinkItem" }
>;

type SocialLinkItem = NonNullable<SocialLink["links"]>[number];

type BlockWithId = { id?: string | null };

function getId(block: BlockWithId, fallback = ""): string {
  return block.id ?? fallback;
}

type NavbarEntry<K extends string = "displayText"> = {
  [P in K]: string;
} & {
  displayIcon?: IconName;
};

function TextWrapper<K extends string>({
  navbarEntry,
  entryKey,
  hideResponsive = false,
}: {
  navbarEntry: NavbarEntry<K>;
  entryKey: K;
  hideResponsive?: boolean;
}) {
  return (
    <>
      {navbarEntry.displayIcon && (
        <Icon asChild hideBelow="2xl">
          <IconDisplay name={navbarEntry.displayIcon} />
        </Icon>
      )}
      <Box
        as="span"
        hideBelow={hideResponsive && navbarEntry.displayIcon ? "xl" : undefined}
      >
        {navbarEntry[entryKey]}
      </Box>
    </>
  );
}

const LIVE_RESULT_BETA = !!process.env.LIVE_RESULT_BETA;

function renderDesktopSubEntry(
  subEntry: NavDropdownSubEntry,
  parentId: string | null | undefined,
) {
  const safeParentId = parentId ?? "";
  const safeSubId = getId(subEntry);
  switch (subEntry.blockType) {
    case "LinkItem":
      return (
        <Menu.Item value={`${safeParentId}/${safeSubId}`} asChild>
          <Link href={subEntry.targetLink}>
            <TextWrapper navbarEntry={subEntry} entryKey="displayText" />
          </Link>
        </Menu.Item>
      );
    case "ExternalLinkItem":
      return (
        <Menu.Item value={`${safeParentId}/${safeSubId}`} asChild>
          <a href={subEntry.targetLink}>
            <TextWrapper navbarEntry={subEntry} entryKey="displayText" />
          </a>
        </Menu.Item>
      );
    case "VisualDivider":
      return <Menu.Separator />;
    case "NestedDropdown":
      return (
        <Menu.Root
          positioning={{
            placement: "right-start",
            gutter: -2,
          }}
        >
          <Menu.TriggerItem>{subEntry.title}</Menu.TriggerItem>
          <Menu.Positioner>
            <Menu.Content>
              {subEntry.entries.map((nestedEntry, nestedIndex) => (
                <React.Fragment
                  key={getId(nestedEntry, `nested-${nestedIndex}`)}
                >
                  {renderDesktopNestedEntry(
                    nestedEntry,
                    safeParentId,
                    safeSubId,
                  )}
                </React.Fragment>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      );
    default:
      return null;
  }
}

function renderDesktopNestedEntry(
  nestedEntry: NestedLinkItem,
  parentId: string | null | undefined,
  subId: string | null | undefined,
) {
  const safeParentId = parentId ?? "";
  const safeSubId = subId ?? "";
  const safeNestedId = getId(nestedEntry);
  switch (nestedEntry.blockType) {
    case "LinkItem":
      return (
        <Menu.Item
          value={`${safeParentId}/${safeSubId}/${safeNestedId}`}
          asChild
        >
          <Link href={nestedEntry.targetLink}>
            <TextWrapper navbarEntry={nestedEntry} entryKey="displayText" />
          </Link>
        </Menu.Item>
      );
    case "ExternalLinkItem":
      return (
        <Menu.Item
          value={`${safeParentId}/${safeSubId}/${safeNestedId}`}
          asChild
        >
          <a href={nestedEntry.targetLink}>
            <TextWrapper navbarEntry={nestedEntry} entryKey="displayText" />
          </a>
        </Menu.Item>
      );
    default:
      return null;
  }
}

function renderDesktopEntry(entry: NavEntry, socialLinks: SocialLinkItem[]) {
  switch (entry.blockType) {
    case "LinkItem":
      return (
        <Button asChild variant="ghost" size="sm" px="2">
          <Link href={entry.targetLink}>
            <TextWrapper
              navbarEntry={entry}
              entryKey="displayText"
              hideResponsive
            />
          </Link>
        </Button>
      );
    case "ExternalLinkItem":
      return (
        <Button asChild variant="ghost" size="sm" px="2">
          <a href={entry.targetLink}>
            <TextWrapper
              navbarEntry={entry}
              entryKey="displayText"
              hideResponsive
            />
          </a>
        </Button>
      );
    case "NavDropdown":
      return (
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button variant="ghost" size="sm" px="2">
              <TextWrapper
                navbarEntry={entry}
                entryKey="title"
                hideResponsive
              />
              <LuChevronDown />
            </Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              {entry.entries.map((subEntry, subIndex) => (
                <React.Fragment key={getId(subEntry, `sub-${subIndex}`)}>
                  {renderDesktopSubEntry(subEntry, getId(entry))}
                </React.Fragment>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      );
    case "SocialsMenu":
      if (socialLinks.length === 0) return null;
      return (
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button variant="ghost" size="sm">
              <TextWrapper
                navbarEntry={{ ...entry, displayIcon: "External Link" }}
                entryKey="label"
                hideResponsive
              />
              <LuChevronDown />
            </Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              {socialLinks.map((item, itemIndex) => (
                <Menu.Item
                  key={getId(item, `social-${itemIndex}`)}
                  value={getId(item, item.targetLink)}
                  asChild
                >
                  <a href={item.targetLink} target="_blank" rel="noreferrer">
                    <TextWrapper navbarEntry={item} entryKey="displayText" />
                  </a>
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      );
    default:
      return null;
  }
}

function renderMobileSubEntry(subEntry: NavDropdownSubEntry) {
  switch (subEntry.blockType) {
    case "LinkItem":
      return (
        <Button asChild variant="ghost" size="sm" justifyContent="flex-start">
          <Link href={subEntry.targetLink}>
            <TextWrapper navbarEntry={subEntry} entryKey="displayText" />
          </Link>
        </Button>
      );
    case "ExternalLinkItem":
      return (
        <Button asChild variant="ghost" size="sm" justifyContent="flex-start">
          <a href={subEntry.targetLink}>
            <TextWrapper navbarEntry={subEntry} entryKey="displayText" />
          </a>
        </Button>
      );
    case "VisualDivider":
      return <Separator />;
    case "NestedDropdown":
      return (
        <Collapsible.Root>
          <Collapsible.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              justifyContent="flex-start"
              width="full"
            >
              {subEntry.title}
              <Collapsible.Indicator ml="auto">
                <LuChevronDown />
              </Collapsible.Indicator>
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <VStack align="stretch" pl={4} gap={1} py={1}>
              {subEntry.entries.map((nestedEntry, nestedIndex) => (
                <React.Fragment
                  key={getId(nestedEntry, `m-nested-${nestedIndex}`)}
                >
                  {renderMobileNestedEntry(nestedEntry)}
                </React.Fragment>
              ))}
            </VStack>
          </Collapsible.Content>
        </Collapsible.Root>
      );
    default:
      return null;
  }
}

function renderMobileNestedEntry(nestedEntry: NestedLinkItem) {
  switch (nestedEntry.blockType) {
    case "LinkItem":
      return (
        <Button asChild variant="ghost" size="sm" justifyContent="flex-start">
          <Link href={nestedEntry.targetLink}>
            <TextWrapper navbarEntry={nestedEntry} entryKey="displayText" />
          </Link>
        </Button>
      );
    case "ExternalLinkItem":
      return (
        <Button asChild variant="ghost" size="sm" justifyContent="flex-start">
          <a href={nestedEntry.targetLink}>
            <TextWrapper navbarEntry={nestedEntry} entryKey="displayText" />
          </a>
        </Button>
      );
    default:
      return null;
  }
}

function renderMobileEntry(entry: NavEntry, socialLinks: SocialLinkItem[]) {
  switch (entry.blockType) {
    case "LinkItem":
      return (
        <Button asChild variant="ghost" size="sm" justifyContent="flex-start">
          <Link href={entry.targetLink}>
            <TextWrapper navbarEntry={entry} entryKey="displayText" />
          </Link>
        </Button>
      );
    case "ExternalLinkItem":
      return (
        <Button asChild variant="ghost" size="sm" justifyContent="flex-start">
          <a href={entry.targetLink}>
            <TextWrapper navbarEntry={entry} entryKey="displayText" />
          </a>
        </Button>
      );
    case "NavDropdown":
      return (
        <Collapsible.Root>
          <Collapsible.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              justifyContent="flex-start"
              width="full"
            >
              <TextWrapper navbarEntry={entry} entryKey="title" />
              <Collapsible.Indicator ml="auto">
                <LuChevronDown />
              </Collapsible.Indicator>
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <VStack align="stretch" pl={4} gap={1} py={1}>
              {entry.entries.map((subEntry, subIndex) => (
                <React.Fragment key={getId(subEntry, `m-sub-${subIndex}`)}>
                  {renderMobileSubEntry(subEntry)}
                </React.Fragment>
              ))}
            </VStack>
          </Collapsible.Content>
        </Collapsible.Root>
      );
    case "SocialsMenu":
      if (socialLinks.length === 0) return null;
      return (
        <Collapsible.Root>
          <Collapsible.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              justifyContent="flex-start"
              width="full"
            >
              <TextWrapper
                navbarEntry={{ ...entry, displayIcon: "External Link" }}
                entryKey="label"
              />
              <Collapsible.Indicator ml="auto">
                <LuChevronDown />
              </Collapsible.Indicator>
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <VStack align="stretch" pl={4} gap={1} py={1}>
              {socialLinks.map((item, itemIndex) => (
                <Button
                  key={getId(item, `m-social-${itemIndex}`)}
                  asChild
                  variant="ghost"
                  size="sm"
                  justifyContent="flex-start"
                >
                  <a href={item.targetLink} target="_blank" rel="noreferrer">
                    <TextWrapper navbarEntry={item} entryKey="displayText" />
                  </a>
                </Button>
              ))}
            </VStack>
          </Collapsible.Content>
        </Collapsible.Root>
      );
    default:
      return null;
  }
}

export default async function Navbar() {
  const payload = await getPayload({ config });
  const [navbar, socialLinksGlobal] = await Promise.all([
    payload.findGlobal({ slug: "nav" }),
    payload.findGlobal({ slug: "social-links" }),
  ]);

  const session = await auth();
  const socialLinks = socialLinksGlobal.links ?? [];

  // Prevent people part of the Live Results Beta to escape onto the payload pages
  const navbarEntries = LIVE_RESULT_BETA ? [] : navbar.entry;
  const showEmptyMessage = !LIVE_RESULT_BETA && navbarEntries.length === 0;

  return (
    <Box
      borderBottom="md"
      borderColor="border"
      bg="bg"
      data-testid="header-navbar"
    >
      <RefreshRouteOnSave />
      <Collapsible.Root>
        <HStack padding="3" justifyContent="space-between">
          <HStack>
            {!LIVE_RESULT_BETA && <WCALogo />}
            <Box hideFrom="xl">
              <Collapsible.Trigger asChild>
                <IconButton variant="ghost" aria-label="Toggle navigation">
                  <Icon size="lg" asChild>
                    <LuMenu />
                  </Icon>
                </IconButton>
              </Collapsible.Trigger>
            </Box>
            <HStack hideBelow="xl" gap={0}>
              {navbarEntries.map((navbarEntry, navIndex) => (
                <React.Fragment key={getId(navbarEntry, `nav-${navIndex}`)}>
                  {renderDesktopEntry(navbarEntry, socialLinks)}
                </React.Fragment>
              ))}
            </HStack>
          </HStack>
          <Box flex="1" mx={4}>
            <WcaSearch />
          </Box>
          <HStack>
            {showEmptyMessage && (
              <Text hideBelow="md">Oh no, there are no navbar items!</Text>
            )}
            <ColorModeButton />
            <Box hideBelow="md">
              <LanguageSelector />
            </Box>
            <Box hideBelow="md">
              <AvatarMenu session={session} />
            </Box>
          </HStack>
        </HStack>

        <Box hideFrom="xl">
          <Collapsible.Content>
            <VStack align="stretch" px={3} pb={3} gap={1}>
              {showEmptyMessage && (
                <Text>Oh no, there are no navbar items!</Text>
              )}
              {navbarEntries.map((navbarEntry, navIndex) => (
                <React.Fragment key={getId(navbarEntry, `m-nav-${navIndex}`)}>
                  {renderMobileEntry(navbarEntry, socialLinks)}
                </React.Fragment>
              ))}
              <Separator />
              <VStack align="start">
                <LanguageSelector />
                <AvatarMenu session={session} />
              </VStack>
            </VStack>
          </Collapsible.Content>
        </Box>
      </Collapsible.Root>
    </Box>
  );
}
